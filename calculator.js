(() => {
  const currency = (value) => `₹ ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const valueOf = (id) => Number(document.getElementById(id)?.value || 0);
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = currency(value);
  };
  const onClick = (id, handler) => {
    const button = document.getElementById(id);
    if (button) button.addEventListener('click', handler);
  };

  let sipChart;
  let emiChart;
  let lumpChart;

  const drawChart = (canvasId, chartRef, labels, values) => {
    if (!window.Chart) return chartRef;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return chartRef;
    if (chartRef) chartRef.destroy();
    return new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: ['#0B3D91', '#D4AF37'], borderWidth: 0 }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
  };

  onClick('calculateSip', () => {
    const monthly = valueOf('sipAmount');
    const annualRate = valueOf('sipRate');
    const years = valueOf('sipYear');
    if (monthly <= 0 || annualRate < 0 || years <= 0) return;
    const months = years * 12;
    const rate = annualRate / 1200;
    const futureValue = rate === 0 ? monthly * months : monthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
    const invested = monthly * months;
    const gain = futureValue - invested;
    setText('investAmount', monthly);
    setText('totalInvest', invested);
    setText('wealthGain', gain);
    setText('sipResult', futureValue);
    sipChart = drawChart('sipChart', sipChart, ['Invested', 'Returns'], [invested, gain]);
  });

  onClick('calculateEMI', () => {
    const principal = valueOf('loanAmount');
    const annualRate = valueOf('loanRate');
    const years = valueOf('loanYear');
    if (principal <= 0 || annualRate < 0 || years <= 0) return;
    const months = years * 12;
    const rate = annualRate / 1200;
    const emi = rate === 0 ? principal / months : principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    const total = emi * months;
    const interest = total - principal;
    setText('emiResult', emi);
    setText('principalAmount', principal);
    setText('interestAmount', interest);
    setText('totalPayment', total);
    emiChart = drawChart('emiChart', emiChart, ['Principal', 'Interest'], [principal, interest]);
  });

  onClick('calculateLumpsum', () => {
    const invested = valueOf('lumpAmount');
    const annualRate = valueOf('lumpRate');
    const years = valueOf('lumpYear');
    if (invested <= 0 || annualRate < 0 || years <= 0) return;
    const futureValue = invested * Math.pow(1 + annualRate / 100, years);
    const gain = futureValue - invested;
    setText('lumpInvestment', invested);
    setText('lumpGain', gain);
    setText('lumpResult', futureValue);
    lumpChart = drawChart('lumpChart', lumpChart, ['Investment', 'Gain'], [invested, gain]);
  });

  onClick('calculateRetirement', () => {
    const currentAge = valueOf('currentAge');
    const retirementAge = valueOf('retireAge');
    const monthly = valueOf('retireSip');
    const annualRate = valueOf('retireRate');
    const years = retirementAge - currentAge;
    if (monthly <= 0 || annualRate < 0 || years <= 0) return;
    const rate = annualRate / 1200;
    const months = years * 12;
    const corpus = rate === 0 ? monthly * months : monthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
    setText('retireResult', corpus);
  });

  onClick('calculateGoal', () => {
    const goal = valueOf('goalAmount');
    const years = valueOf('goalYear');
    const annualRate = valueOf('goalRate');
    if (goal <= 0 || annualRate < 0 || years <= 0) return;
    const rate = annualRate / 1200;
    const months = years * 12;
    const monthly = rate === 0 ? goal / months : goal / (((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate));
    setText('goalResult', monthly);
  });

  onClick('calculateTax', () => {
    const income = valueOf('taxIncome');
    const rate = valueOf('taxRate');
    const tax = income * rate / 100;
    setText('annualIncome', income);
    setText('estimatedTax', tax);
    setText('afterTax', income - tax);
    setText('taxResult', tax);
  });

  onClick('calculateGST', () => {
    const amount = valueOf('gstAmount');
    const rate = valueOf('gstRate');
    const gst = amount * rate / 100;
    setText('originalAmount', amount);
    setText('gstValue', gst);
    setText('gstTotal', amount + gst);
  });

  onClick('calculateHLV', () => setText('hlvResult', valueOf('hlvIncome') * valueOf('hlvYears')));

  onClick('calculateEducation', () => {
    const goal = valueOf('eduAmount');
    const years = valueOf('eduYear');
    const annualRate = valueOf('eduRate');
    if (goal <= 0 || annualRate < 0 || years <= 0) return;
    const rate = annualRate / 1200;
    const months = years * 12;
    const monthly = rate === 0 ? goal / months : goal / (((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate));
    setText('educationResult', monthly);
  });
})();
