'use client';

import { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
  description: string;
}

interface ReceiptsSectionProps {
  userId: string;
}

export default function ReceiptsSection({ userId }: ReceiptsSectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReceipts, setShowReceipts] = useState(false);

  useEffect(() => {
    if (showReceipts && userId) {
      fetchInvoices();
    }
  }, [showReceipts, userId]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices || []);
      } else {
        console.error('Error fetching invoices:', data.error);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = (invoice: Invoice) => {
    if (invoice.invoicePdf) {
      window.open(invoice.invoicePdf, '_blank');
    } else if (invoice.hostedInvoiceUrl) {
      window.open(invoice.hostedInvoiceUrl, '_blank');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShowReceipts(!showReceipts)}
        className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            Receipts & Invoices
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              showReceipts ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {showReceipts && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No receipts found
            </p>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {invoice.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(invoice.created)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                  {(invoice.invoicePdf || invoice.hostedInvoiceUrl) && (
                    <button
                      onClick={() => handleDownloadReceipt(invoice)}
                      className="ml-3 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      aria-label="Download receipt"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

