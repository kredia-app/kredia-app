"use client";
import React, { useState, useEffect } from "react";
import {
  Calculator,
  TrendingUp,
  Calendar,
  DollarSign,
  Percent,
  Info,
} from "lucide-react";

export default function LoanCalculator() {
  const euribor_data = {
    "2015-01-01": 0.04,
    "2016-01-01": -0.19,
    "2017-01-01": -0.33,
    "2018-01-01": -0.31,
    "2019-01-01": -0.31,
    "2020-01-01": -0.37,
    "2021-01-01": -0.53,
    "2022-01-01": -0.5,
    "2023-01-01": 0.4,
    "2024-01-01": 2.19,
  };

  const bond_data = {
    "2015-01-01": 3.5,
    "2016-01-01": 3.45,
    "2017-01-01": 3.4,
    "2018-01-01": 3.25,
    "2019-01-01": 3.15,
    "2020-01-01": 3.1,
    "2021-01-01": 3.0,
    "2022-01-01": 3.3,
    "2023-01-01": 4.0,
    "2024-01-01": 4.5,
  };

  const [loanAmount, setLoanAmount] = useState("100000");
  const [currency, setCurrency] = useState("EUR");
  const [periodValue, setPeriodValue] = useState("20");
  const [periodUnit, setPeriodUnit] = useState("years");
  const [totalMonths, setTotalMonths] = useState(240);
  const [baseRate, setBaseRate] = useState("3");
  const [euriborRate, setEuriborRate] = useState("2.5");
  const rateType = currency === "ALL" ? "treasury" : "euribor";

  const [customPeriods, setCustomPeriods] = useState([
    { months: "12", rate: "1", enabled: true },
    { months: "12", rate: "2", enabled: false },
    { months: "12", rate: "2.5", enabled: false },
  ]);

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalPayment: 0,
    totalInterest: 0,
    avgMonthlyPayment: 0,
  });

  useEffect(() => {
    const pVal = parseFloat(periodValue);
    if (!isNaN(pVal) && pVal > 0) {
      const months = periodUnit === "years" ? pVal * 12 : pVal;
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
    if (
      !loanAmount ||
      !periodValue ||
      !baseRate ||
      !euriborRate ||
      isNaN(loanAmt) ||
      isNaN(bRate) ||
      isNaN(eRate) ||
      loanAmt <= 0 ||
      totalMonths <= 0
    ) {
      setPayments([]);
      setSummary({
        totalPayment: 0,
        totalInterest: 0,
        avgMonthlyPayment: 0,
      });
      return;
    }

    let remainingBalance = loanAmt;
    const paymentsArray: any = [];
    const displayPaymentsArray: any = [];
    let currentMonth = 1;
    const maxDisplayMonths = 60; // Limit table display to 5 years

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

      const variableRate = eRate; // rateType === "euribor" ? eRate : bRate;
      return (bRate + variableRate) / 100 / 12;
    };

    while (remainingBalance > 0.01 && currentMonth <= totalMonths) {
      const monthlyRate = getInterestRate(currentMonth);
      const remainingMonths = totalMonths - currentMonth + 1;

      let monthlyPayment;
      if (monthlyRate === 0) {
        monthlyPayment = remainingBalance / remainingMonths;
      } else {
        monthlyPayment =
          (remainingBalance *
            (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths))) /
          (Math.pow(1 + monthlyRate, remainingMonths) - 1);
      }

      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;

      remainingBalance -= principalPayment;

      const paymentData = {
        month: currentMonth,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance),
        rate: monthlyRate * 12 * 100,
      };

      paymentsArray.push(paymentData);

      // Only add to display array if within first 5 years
      if (currentMonth <= maxDisplayMonths) {
        displayPaymentsArray.push(paymentData);
      }

      currentMonth++;
    }

    setPayments(displayPaymentsArray);

    const totalPayment = paymentsArray.reduce(
      (sum: any, p: { payment: any }) => sum + p.payment,
      0
    );
    const totalInterest = paymentsArray.reduce(
      (sum: any, p: { interest: any }) => sum + p.interest,
      0
    );

    setSummary({
      totalPayment,
      totalInterest,
      avgMonthlyPayment: totalPayment / paymentsArray.length || 0,
    });
  };

  useEffect(() => {
    calculatePayments();
  }, [loanAmount, totalMonths, baseRate, euriborRate, rateType, customPeriods]);

  const formatCurrency = (amount: number | bigint) => {
    const currencyCode = currency === "ALL" ? "ALL" : "EUR";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const tooltips: Record<string, string> = {
    customPeriods:
      "Shumë banka ofrojnë norma speciale më të ulëta për vitet e para (p.sh. 1% për vitin e parë). Këtu mund t'i konfiguroni ato.",
  };

  const getHistoricalRates = () => {
    const data = rateType === "euribor" ? euribor_data : bond_data;
    return Object.entries(data).map(([year, rate]) => ({
      year: year.substring(0, 4),
      rate: rate,
    }));
  };

  const InfoTooltip = ({ id, text }: { id: string; text: string }) => (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        onClick={() => setActiveTooltip(activeTooltip === id ? null : id)}
        onBlur={() => setTimeout(() => setActiveTooltip(null), 200)}
        className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
      >
        <Info className="w-4 h-4" />
      </button>
      {activeTooltip === id && (
        <div className="absolute z-10 w-64 p-3 mt-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg -left-28">
          <div className="absolute -top-2 left-32 w-4 h-4 bg-gray-800 transform rotate-45"></div>
          {text}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Ad Space - WhatsApp Contact */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <a
            href="mailto:krediaaplikacion@gmail.com?subject=Kërkesë%20për%20Ofertë%20Personale&body=Përshëndetje,%0D%0A%0D%0ADëshiroj%20të%20marr%20një%20ofertë%20personale%20për%20kredi.%0D%0A%0D%0AFaleminderit!"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 text-white hover:opacity-90 transition-opacity"
          >
            <div className="text-3xl">💬</div>
            <div>
              <p className="font-bold text-lg">Dëshironi të Reklamoni Këtu?</p>
              <p className="text-sm text-emerald-50">
                Kontaktoni në email{" "}
                <b className="cursor-pointer underline">
                  <i>krediaaplikacion@gmail.com</i>
                </b>{" "}
                për hapësira reklamash
              </p>
            </div>
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Llogaritësi i Kredisë
            </h1>
          </div>
          <p className="text-gray-600">
            Llogaritni pagesat mujore të kredisë tuaj me periudha interesi të
            personalizuara
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
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
                      className="text-gray-900 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                      placeholder="Shuma"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="text-gray-900 w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-semibold"
                    >
                      <option value="EUR">EUR</option>
                      <option value="ALL">Lekë</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Norma referuese:{" "}
                    {rateType === "euribor" ? "Euribor" : "Bono Thesari"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Periudha Totale
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      maxLength={3}
                      value={periodValue}
                      onChange={(e) => setPeriodValue(e.target.value)}
                      className="text-gray-900 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                      placeholder="Kohëzgjatja"
                    />
                    <select
                      value={periodUnit}
                      onChange={(e) => setPeriodUnit(e.target.value)}
                      className="text-gray-900 w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-semibold"
                    >
                      <option value="years">Vjet</option>
                      <option value="months">Muaj</option>
                    </select>
                  </div>
                  {periodValue && !isNaN(parseFloat(periodValue)) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {periodUnit === "years"
                        ? `${totalMonths} muaj`
                        : `${(totalMonths / 12).toFixed(1)} vjet`}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Norma{" "}
                    {rateType === "euribor" ? "Euribor" : "e Bonos së Thesarit"}{" "}
                    (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={euriborRate}
                    onChange={(e) => setEuriborRate(e.target.value)}
                    className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      📊 Historiku i normave (10 vitet e fundit):
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {getHistoricalRates().map(({ year, rate }) => (
                        <div key={year} className="text-center">
                          <div className="text-xs font-semibold text-gray-600">
                            {year}
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              rate < 0
                                ? "text-red-600"
                                : rate < 2
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          >
                            {rate}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                  {baseRate &&
                    euriborRate &&
                    !isNaN(parseFloat(baseRate)) &&
                    !isNaN(parseFloat(euriborRate)) && (
                      <p className="text-sm text-gray-500 mt-1">
                        Norma variabël: {baseRate}% + {euriborRate}% ={" "}
                        {(
                          parseFloat(baseRate) + parseFloat(euriborRate)
                        ).toFixed(2)}
                        %
                      </p>
                    )}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Periudha të Personalizuara Interesi
                  <InfoTooltip
                    id="customPeriods"
                    text={tooltips.customPeriods}
                  />
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Konfiguroni norma speciale për 3 vitet e para
                </p>

                {customPeriods.map((period, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 border border-gray-200 rounded-lg"
                  >
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
                          <label className="block text-xs text-gray-600 mb-1">
                            Muaj
                          </label>
                          <input
                            type="number"
                            value={period.months}
                            onChange={(e) =>
                              updatePeriod(index, "months", e.target.value)
                            }
                            className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Norma (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={period.rate}
                            onChange={(e) =>
                              updatePeriod(index, "rate", e.target.value)
                            }
                            className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Ad Space - Tip */}
              <div className="mt-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-5 text-white lg:hidden">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">⚡</div>
                  <h3 className="text-lg font-bold">Këshillë e Shpejtë</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  Pagesa paraprake e 20% të kredisë ul normën e interesit dhe ju
                  kursen mijëra euro!
                </p>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-1">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Pagesa Totale
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(summary.totalPayment)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Interesi Total
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(summary.totalInterest)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Pagesa Mujore Mesatare
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(summary.avgMonthlyPayment)}
                </p>
              </div>
            </div>

            {/* Payment Schedule Table */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Grafiku i Pagesave
                {/* {totalMonths > 60 && (
                  <span className="text-sm font-normal text-gray-600">
                    (Shfaqen 5 vitet e para)
                  </span>
                )} */}
              </h2>

              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Muaji
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Pagesa
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Kredia
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Interesi
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Norma
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Bilanci
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {payments.map((payment: any) => (
                          <tr key={payment.month} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-700 font-medium">
                              {payment.month}
                            </td>
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

                      {totalMonths > 60 && (
                        <tfoot>
                          <tr>
                            <td colSpan={6} className="text-center py-3">
                              <span className="text-sm font-normal text-gray-600">
                                <i>
                                  *Shfaqen max deri ne 5 vite pasi ne vazhdim
                                  grafiku do te jete i njejte.
                                </i>
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    Plotësoni të gjitha fushat për të parë grafikun e pagesave
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Ad Space - Email Contact */}
            <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">💰</div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      Dëshironi të reklamoni këtu?
                    </h3>
                    <p className="text-sm text-blue-100">
                      Kontaktoni në email{" "}
                      <b className="cursor-pointer underline">
                        <i>krediaaplikacion@gmail.com</i>
                      </b>
                    </p>
                  </div>
                </div>
                <a
                  href="mailto:krediaaplikacion@gmail.com?subject=Kërkesë%20për%20Ofertë%20Personale&body=Përshëndetje,%0D%0A%0D%0ADëshiroj%20të%20marr%20një%20ofertë%20personale%20për%20kredi.%0D%0A%0D%0AFaleminderit!"
                  className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  Dërgo Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad Space - Educational Tip */}
      <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-white">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="text-xl font-bold mb-2">Dini që?</h3>
            <p className="text-sm max-w-3xl mx-auto leading-relaxed">
              Normat promocionale që bankat ofrojnë (1-2% për vitet e para) mund
              të ju kursejnë deri në{" "}
              <span className="font-bold">€2,000-3,000</span> gjatë jetës së
              kredisë. Përdorni "Periudha të Personalizuara Interesi" për të
              simuluar këto oferta!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
