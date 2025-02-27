import React from "react";

const Invoice = ({ invoiceData }) => {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tax Invoice</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Invoice #: {invoiceData.invoiceNumber}</p>
          <p className="text-sm text-gray-500">Date: {invoiceData.date}</p>
        </div>
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">From:</h2>
          <p className="text-gray-600">{invoiceData.businessName}</p>
          <p className="text-gray-600">{invoiceData.businessAddress}</p>
          <p className="text-gray-600">{invoiceData.businessEmail}</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold text-gray-700">To:</h2>
          <p className="text-gray-600">{invoiceData.clientName}</p>
          <p className="text-gray-600">{invoiceData.clientAddress}</p>
          <p className="text-gray-600">{invoiceData.clientEmail}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm font-semibold">
            <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200 text-gray-700">
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2 text-right">{item.quantity}</td>
              <td className="px-4 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="flex justify-end">
        <table className="w-1/3 text-right">
          <tbody>
            <tr>
              <td className="text-gray-600 font-semibold">Subtotal:</td>
              <td className="pl-4 text-gray-700">${invoiceData.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="text-gray-600 font-semibold">Tax ({invoiceData.taxRate}%):</td>
              <td className="pl-4 text-gray-700">${invoiceData.taxAmount.toFixed(2)}</td>
            </tr>
            <tr className="border-t border-gray-300">
              <td className="text-lg font-bold text-gray-800">Total:</td>
              <td className="pl-4 text-lg font-bold text-gray-900">${invoiceData.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Thank you for your business!</p>
        <p>If you have any questions, contact us at {invoiceData.businessEmail}</p>
      </div>
    </div>
  );
};

export default Invoice;
