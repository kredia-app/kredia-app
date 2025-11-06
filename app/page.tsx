"use client"
import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Calendar, DollarSign, Percent } from 'lucide-react';

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [currency, setCurrency] = useState('EUR');
  const [periodValue, setPeriodValue] = useState('20');
  const [periodUnit, setPeriodUnit] = useState('years');
  const [totalMonths, setTotalMonths] = useState(240);
  const [baseRate, setBaseRate] = useState('3');
  const [euriborRate, setEuriborRate] = useState('2.5');
  const rateType = currency === 'ALL' ? 'treasury' : 'euribor';
  
  const [customPeriods, setCustomPeriods] = useState([
    { months: '12', rate: '1', enabled: true },
    { months: '12', rate: '2', enabled: false },
    { months: '12', rate: '2.5', enabled: false }
  ]);
  
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalPayment: 0,
    totalInterest: 0,
    avgMonthlyPayment: 0
  });

  useEffect(() => {
    const pVal = parseFloat(periodValue);
    if (!isNaN(pVal) && pVal > 0) {
      const months = periodUnit === 'years' ? pVal * 12 : pVal;
      setTotalMonths(Math.round(months));
    }
  }, [periodValue, periodUnit]);

  const togglePeriod = (index: number) => {
    const newPeriods = [...customPeriods];
    newPeriods[index].enabled = !newPeriods[index].enabled;
    setCustomPeriods(newPeriods);
  };

  const updatePeriod = (index: number, field: string, value: string) => {
    const newPeriods: any = [...customPeriods];
    newPeriods[index][field] = value;
    setCustomPeriods(newPeriods);
  };

  const calculatePayments = () => {
    const loanAmt = parseFloat(loanAmount);
    const bRate = parseFloat(baseRate);
    const eRate = parseFloat(euriborRate);

    // Don't calculate if any required field is empty or invalid
    if (!loanAmount || !periodValue || !baseRate || !euriborRate || 
        isNaN(loanAmt) || isNaN(bRate) || isNaN(eRate) || 
        loanAmt <= 0 || totalMonths <= 0) {
      setPayments([]);
      setSummary({
        totalPayment: 0,
        totalInterest: 0,
        avgMonthlyPayment: 0
      });
      return;
    }

    let remainingBalance = loanAmt;
    const paymentsArray: any = [];
    let currentMonth = 1;
    
    const getInterestRate = (month: number) => {
      let cumulativeMonths = 0;
      
      for (let period of customPeriods) {
        if (!period.enabled) continue;
        const pMonths = parseFloat(period.months);
        const pRate = parseFloat(period.rate);
        if (isNaN(pMonths) || isNaN(pRate)) continue;
        
        cumulativeMonths += pMonths;
        if (month <= cumulativeMonths) {
          return pRate / 100 / 12;
        }
      }
      
      const variableRate = rateType === 'euribor' ? eRate : bRate;
      return (bRate + variableRate) / 100 / 12;
    };

    while (remainingBalance > 0.01 && currentMonth <= totalMonths) {
      const monthlyRate = getInterestRate(currentMonth);
      const remainingMonths = totalMonths - currentMonth + 1;
      
      let monthlyPayment;
      if (monthlyRate === 0) {
        monthlyPayment = remainingBalance / remainingMonths;
      } else {
        monthlyPayment = remainingBalance * (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / 
                        (Math.pow(1 + monthlyRate, remainingMonths) - 1);
      }
      
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      remainingBalance -= principalPayment;
      
      paymentsArray.push({
        month: currentMonth,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance),
        rate: monthlyRate * 12 * 100
      });
      
      currentMonth++;
    }
    
    setPayments(paymentsArray);
    
    const totalPayment = paymentsArray.reduce((sum: any, p: { payment: any; }) => sum + p.payment, 0);
    const totalInterest = paymentsArray.reduce((sum: any, p: { interest: any; }) => sum + p.interest, 0);
    
    setSummary({
      totalPayment,
      totalInterest,
      avgMonthlyPayment: totalPayment / paymentsArray.length || 0
    });
  };

  useEffect(() => {
    calculatePayments();
  }, [loanAmount, totalMonths, baseRate, euriborRate, rateType, customPeriods]);

  const formatCurrency = (amount: number | bigint) => {
    const currencyCode = currency === 'ALL' ? 'ALL' : 'EUR';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Ad Space */}
      <div className="bg-gray-200 border-2 border-dashed border-gray-400 h-24 flex items-center justify-center">
        <p className="text-gray-600 font-semibold">Hapësirë Reklamash Kryesore (728x90)</p>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Llogaritësi i Kredisë</h1>
          </div>
          <p className="text-gray-600">Llogaritni pagesat mujore të kredisë tuaj me periudha interesi të personalizuara</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar Ad */}
          <div className="hidden lg:block">
            <div className="bg-gray-200 border-2 border-dashed border-gray-400 h-96 flex items-center justify-center sticky top-4">
              <p className="text-gray-600 font-semibold text-center">Reklamë Anësore<br/>(300x600)</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-indigo-600" />
                Detajet e Kredisë
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shuma e Kredisë dhe Monedha
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Shuma"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold"
                    >
                      <option value="EUR">EUR</option>
                      <option value="ALL">Lekë</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Norma referuese: {rateType === 'euribor' ? 'Euribor' : 'Bono Thesari'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Periudha Totale
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={periodValue}
                      onChange={(e) => setPeriodValue(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Kohëzgjatja"
                    />
                    <select
                      value={periodUnit}
                      onChange={(e) => setPeriodUnit(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold"
                    >
                      <option value="years">Vjet</option>
                      <option value="months">Muaj</option>
                    </select>
                  </div>
                  {periodValue && !isNaN(parseFloat(periodValue)) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {periodUnit === 'years' ? `${totalMonths} muaj` : `${(totalMonths / 12).toFixed(1)} vjet`}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Norma {rateType === 'euribor' ? 'Euribor' : 'e Bonos së Thesarit'} (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={euriborRate}
                    onChange={(e) => setEuriborRate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Norma Bazë e Marzhit (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {baseRate && euriborRate && !isNaN(parseFloat(baseRate)) && !isNaN(parseFloat(euriborRate)) && (
                    <p className="text-sm text-gray-500 mt-1">
                      Norma variabël: {baseRate}% + {euriborRate}% = {(parseFloat(baseRate) + parseFloat(euriborRate)).toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Periudha të Personalizuara Interesi
                </h3>
                <p className="text-sm text-gray-600 mb-4">Konfiguroni norma speciale për 3 vitet e para</p>

                {customPeriods.map((period, index) => (
                  <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        checked={period.enabled}
                        onChange={() => togglePeriod(index)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <label className="ml-2 text-sm font-semibold text-gray-700">
                        Viti {index + 1} Normë Speciale
                      </label>
                    </div>
                    
                    {period.enabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Muaj</label>
                          <input
                            type="number"
                            value={period.months}
                            onChange={(e) => updatePeriod(index, 'months', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Norma (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={period.rate}
                            onChange={(e) => updatePeriod(index, 'rate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Ad Space */}
              <div className="mt-6 bg-gray-200 border-2 border-dashed border-gray-400 h-24 flex items-center justify-center lg:hidden">
                <p className="text-gray-600 font-semibold">Reklamë Mobile (320x100)</p>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-1">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                <p className="text-indigo-100 text-sm font-semibold mb-1">Pagesa Totale</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.totalPayment)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <p className="text-purple-100 text-sm font-semibold mb-1">Interesi Total</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.totalInterest)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
                <p className="text-pink-100 text-sm font-semibold mb-1">Pagesa Mujore Mesatare</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.avgMonthlyPayment)}</p>
              </div>
            </div>

            {/* Payment Schedule Table */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Grafiku i Pagesave
              </h2>
              
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Muaji</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Pagesa</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Kredia</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Interesi</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Norma</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Bilanci</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payments.map((payment :any) => (
                          <tr key={payment.month} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-700 font-medium">{payment.month}</td>
                            <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                              {formatCurrency(payment.payment)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              {formatCurrency(payment.principal)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              {formatCurrency(payment.interest)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600">
                              {payment.rate.toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              {formatCurrency(payment.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Plotësoni të gjitha fushat për të parë grafikun e pagesave</p>
                </div>
              )}
            </div>

            {/* Bottom Ad Space */}
            <div className="mt-6 bg-gray-200 border-2 border-dashed border-gray-400 h-32 flex items-center justify-center">
              <p className="text-gray-600 font-semibold">Reklamë Poshtë (728x90)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad Space */}
      <div className="mt-8 bg-gray-200 border-2 border-dashed border-gray-400 h-24 flex items-center justify-center">
        <p className="text-gray-600 font-semibold">Hapësirë Reklamash Fund Faqeje (728x90)</p>
      </div>
    </div>
  );
}