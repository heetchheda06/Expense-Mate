import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { createWorker } from 'tesseract.js';
import { Upload, FileText, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const OcrScanner = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  // Drag and Drop handlers
  const handleDragOver = (e) => { e.preventDefault(); };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      processFileSelection(file);
    } else {
      showToast('Please upload a valid image or PDF file', 'warning');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFileSelection(file);
    }
  };

  const processFileSelection = async (file) => {
    setImage(file);
    setExtractedData(null);

    if (file.type === 'application/pdf') {
      setLoading(true);
      setStatusText('Processing PDF...');
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            if (!window.pdfjsLib) {
              throw new Error('PDF processing library not loaded. Please try again.');
            }

            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            if (pdf.numPages === 0) {
              throw new Error('The selected PDF file has no pages.');
            }

            const page = await pdf.getPage(1);
            const scale = 2.0; // Higher scale for OCR precision
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };

            await page.render(renderContext).promise;
            const dataUrl = canvas.toDataURL('image/png');
            setImagePreview(dataUrl);
            showToast('PDF first page loaded for scanning', 'success');
          } catch (err) {
            console.error('Error rendering PDF:', err);
            showToast(err.message || 'Failed to process PDF page.', 'error');
            setImage(null);
            setImagePreview('');
          } finally {
            setLoading(false);
            setStatusText('');
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error('FileReader error:', err);
        showToast('Failed to read PDF file.', 'error');
        setImage(null);
        setImagePreview('');
        setLoading(false);
        setStatusText('');
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Parsing algorithms to identify Merchant, Amount, and Date from text lines
  const parseReceiptContent = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    let merchant = 'Unknown Merchant';
    let amount = 0.00;
    let date = new Date().toISOString().split('T')[0];

    // 1. Merchant: Usually the first line of the receipt is the Store Name
    if (lines.length > 0) {
      // Clean up common header prefixes
      merchant = lines[0]
        .replace(/[*#]/g, '')
        .trim();
      if (merchant.length > 30) {
        merchant = merchant.substring(0, 30) + '...';
      }
    }

    // 2. Amount: Scan for total keywords and find decimal numbers
    // Regex for decimal values (e.g. 45.99, 125.00)
    const amountRegex = /(\d+\.\d{2})/g;
    let highestAmount = 0.0;

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      // Look for total triggers
      if (lower.includes('total') || lower.includes('amount') || lower.includes('due') || lower.includes('net') || lower.includes('subtotal')) {
        const matches = line.match(amountRegex);
        if (matches) {
          matches.forEach((val) => {
            const parsedVal = parseFloat(val);
            if (parsedVal > highestAmount) {
              highestAmount = parsedVal;
            }
          });
        }
      }
    });

    // Fallback: If no keyword total match, pick the largest decimal number on the bill
    if (highestAmount === 0.0) {
      const allMatches = text.match(amountRegex);
      if (allMatches) {
        allMatches.forEach((val) => {
          const parsedVal = parseFloat(val);
          if (parsedVal > highestAmount) {
            highestAmount = parsedVal;
          }
        });
      }
    }
    amount = highestAmount > 0 ? highestAmount : '';

    // 3. Date: Scan for standard MM/DD/YYYY or YYYY-MM-DD
    const dateRegex = /(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})|(\d{2}-\d{2}-\d{4})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      const matchedStr = dateMatch[0];
      if (matchedStr.includes('/')) {
        const parts = matchedStr.split('/');
        // Convert MM/DD/YYYY to YYYY-MM-DD standard HTML input date format
        if (parts[2].length === 4) {
          date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      } else {
        date = matchedStr;
      }
    }

    return { merchant, amount, date };
  };

  // Run Tesseract.js processing pipeline
  const handleScanReceipt = async () => {
    if (!image) return;
    setLoading(true);
    setExtractedData(null);
    
    try {
      setStatusText('Spawning OCR Worker...');
      const worker = await createWorker('eng');

      setStatusText('Reading receipt image lines...');
      const ret = await worker.recognize(imagePreview);
      const text = ret.data.text;
      
      setStatusText('Running parser engines...');
      const parsed = parseReceiptContent(text);
      
      await worker.terminate();

      setExtractedData(parsed);
      showToast('OCR scanned successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('OCR Scan failed. Please insert details manually.', 'error');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  // Save parsed data to localStorage and route user to /expenses to trigger pre-fill drawer
  const handlePrefillRedirect = () => {
    if (!extractedData) return;
    localStorage.setItem('expensemate_ocr_prefill', JSON.stringify(extractedData));
    navigate('/expenses');
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-4xl mx-auto z-10 relative">
      <div className="glow-blob top-10 right-10 scale-75" />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">OCR Bill Scanner</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Upload textbook, grocery, or canteen receipts to automatically catalog expenses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-4">
        {/* Upload Container Panel */}
        <div className="flex flex-col gap-4">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`glass-card p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center h-80 transition-all cursor-pointer relative overflow-hidden ${
              imagePreview ? 'border-indigo-500/30' : 'border-white/10 hover:border-indigo-500/20'
            }`}
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Receipt Preview" 
                className="absolute inset-0 w-full h-full object-contain p-2 rounded-3xl z-10" 
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">Drag & Drop Receipt or PDF</h3>
                <p className="text-xs text-slate-500 font-semibold">Supports PNG, JPG, JPEG, or PDF formats</p>
                <label className="btn-glass text-[11px] font-bold py-2 px-4 border border-white/5 mt-2 cursor-pointer">
                  <span>Browse File</span>
                  <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {imagePreview && (
              <button 
                onClick={() => { setImage(null); setImagePreview(''); setExtractedData(null); }}
                className="btn-glass text-xs font-semibold py-2.5 px-4 w-1/3 border border-white/5"
              >
                Clear File
              </button>
            )}
            <button 
              disabled={!image || loading}
              onClick={handleScanReceipt}
              className="btn-primary text-xs font-semibold py-2.5 px-4 flex-grow flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="animate-pulse">{statusText || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Scan Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* OCR Result verification board */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 min-h-[370px] flex flex-col justify-between relative overflow-hidden">
          <div className="glow-blob -top-20 -left-20 scale-50" />
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-300">Extracted Invoice Details</h3>
            </div>

            {loading ? (
              <div className="flex flex-col gap-4 py-8 items-center text-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs font-semibold text-indigo-400">{statusText}</p>
              </div>
            ) : extractedData ? (
              <div className="flex flex-col gap-4">
                {/* Merchant Name */}
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Store Merchant</span>
                  <span className="text-sm font-semibold text-slate-200">{extractedData.merchant}</span>
                </div>
                {/* Total amount */}
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Amount</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {extractedData.amount ? `$${extractedData.amount.toFixed(2)}` : 'Amount not detected'}
                  </span>
                </div>
                {/* Date */}
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invoice Date</span>
                  <span className="text-sm font-semibold text-slate-200">{new Date(extractedData.date).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-xs font-semibold text-slate-500">
                Extracted invoice metadata will show up here after running the scanning tool.
              </div>
            )}
          </div>

          {extractedData && (
            <button 
              onClick={handlePrefillRedirect}
              className="btn-primary text-xs font-semibold py-3 px-4 w-full flex items-center justify-center gap-2 shadow-glow mt-6"
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-300" />
              <span>Confirm & Prefill Form</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OcrScanner;
