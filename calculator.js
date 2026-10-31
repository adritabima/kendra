(() => {
  const currency = (value) => `₹ ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const valueOf = (id) => Number(document.getElementById(id)?.value || 0);
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = currency(value);
  };
  const setPlainText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  const onClick = (id, handler) => {
    const button = document.getElementById(id);
    if (button) button.addEventListener('click', handler);
  };

  // Monthly contributions are invested at the beginning of each month.
  // An optional annual step-up grows the monthly contribution every 12 months.
  const futureValueOfGrowingSip = (monthlyAmount, monthlyRate, months, annualStepUp = 0) => {
    let futureValue = 0;
    let totalInvested = 0;
    for (let month = 0; month < months; month += 1) {
      const monthlyContribution = monthlyAmount * Math.pow(1 + annualStepUp, Math.floor(month / 12));
      totalInvested += monthlyContribution;
      futureValue = (futureValue + monthlyContribution) * (1 + monthlyRate);
    }
    return { futureValue, totalInvested };
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
    const annualStepUp = valueOf('sipStepUp') / 100;
    if (monthly <= 0 || annualRate < 0 || years <= 0) return;
    const months = years * 12;
    // Groww's SIP calculator converts the annual return to an effective
    // monthly compounded rate; it does not simply divide the annual rate by 12.
    const rate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    const { futureValue, totalInvested: invested } = futureValueOfGrowingSip(monthly, rate, months, Math.max(annualStepUp, 0));
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
    const annualStepUp = valueOf('retireStepUp') / 100;
    const years = retirementAge - currentAge;
    if (monthly <= 0 || annualRate < 0 || years <= 0) return;
    const rate = annualRate / 1200;
    const months = years * 12;
    const { futureValue: corpus, totalInvested } = futureValueOfGrowingSip(monthly, rate, months, Math.max(annualStepUp, 0));
    setText('retireResult', corpus);
    setText('retireOriginalSaving', monthly);
    setText('retireInvestment', totalInvested);
    setText('retireGain', corpus - totalInvested);
  });

  onClick('calculateGoal', () => {
    const goal = valueOf('goalAmount');
    const years = valueOf('goalYear');
    const annualRate = valueOf('goalRate');
    const inflationRate = valueOf('goalInflation') / 100;
    if (goal <= 0 || annualRate < 0 || years <= 0) return;
    const inflationAdjustedGoal = goal * Math.pow(1 + Math.max(inflationRate, 0), years);
    const rate = annualRate / 1200;
    const months = years * 12;
    const monthly = rate === 0 ? inflationAdjustedGoal / months : inflationAdjustedGoal / (((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate));
    setText('goalResult', monthly);
    setText('goalInflatedAmount', inflationAdjustedGoal);
    setText('goalOriginalAmount', goal);
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

  onClick('calculateHLV', () => {
    const annualIncome = valueOf('hlvIncome');
    const years = valueOf('hlvYears');
    const incomeGrowth = valueOf('hlvGrowth') / 100;
    const discountRate = valueOf('hlvDiscount') / 100;
    if (annualIncome <= 0 || years <= 0 || incomeGrowth < 0 || discountRate < 0) return;
    const ratio = (1 + incomeGrowth) / (1 + discountRate);
    const cover = Math.abs(discountRate - incomeGrowth) < 0.000001
      ? annualIncome * years
      : annualIncome * (1 + incomeGrowth) * (1 - Math.pow(ratio, years)) / (discountRate - incomeGrowth);
    setText('hlvResult', cover);
    setText('hlvOriginalIncome', annualIncome);
    setPlainText('hlvYearsValue', `${years} years`);
  });

  onClick('calculateEducation', () => {
    const goal = valueOf('eduAmount');
    const years = valueOf('eduYear');
    const annualRate = valueOf('eduRate');
    const inflationRate = valueOf('eduInflation') / 100;
    if (goal <= 0 || annualRate < 0 || years <= 0) return;
    const inflationAdjustedGoal = goal * Math.pow(1 + Math.max(inflationRate, 0), years);
    const rate = annualRate / 1200;
    const months = years * 12;
    const monthly = rate === 0 ? inflationAdjustedGoal / months : inflationAdjustedGoal / (((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate));
    setText('educationResult', monthly);
    setText('educationOriginalAmount', goal);
    setText('educationInflatedAmount', inflationAdjustedGoal);
  });

  // Additional Indian financial calculators use user-entered rates, because
  // scheme rates and product terms are revised from time to time.
  const additionalCalculatorSpecs = [
    { id: 'fd', title: 'Fixed Deposit', icon: 'fa-building-columns', description: 'Estimate a fixed-deposit maturity value with quarterly compounding.', inputs: [['Principal Amount (₹)', 'fdPrincipal', '100000'], ['Annual Interest Rate (%)', 'fdRate', '7'], ['Tenure (Years)', 'fdYears', '5']], heading: 'FD Maturity Summary', outputs: [['Original Deposit', 'fdOriginal'], ['Estimated Interest', 'fdInterest'], ['Maturity Value', 'fdResult']] },
    { id: 'rd', title: 'Recurring Deposit', icon: 'fa-repeat', description: 'Estimate recurring-deposit value using monthly deposits and monthly compounding.', inputs: [['Monthly Deposit (₹)', 'rdMonthly', '5000'], ['Annual Interest Rate (%)', 'rdRate', '7'], ['Tenure (Years)', 'rdYears', '5']], heading: 'RD Maturity Summary', outputs: [['Total Deposits', 'rdOriginal'], ['Estimated Interest', 'rdInterest'], ['Maturity Value', 'rdResult']] },
    { id: 'ppf', title: 'PPF Calculator', icon: 'fa-piggy-bank', description: 'Estimate annual PPF-style contributions and annual compounding. Enter the current applicable rate.', inputs: [['Annual Contribution (₹)', 'ppfContribution', '150000'], ['Annual Interest Rate (%)', 'ppfRate', '7.1'], ['Contribution Years', 'ppfYears', '15']], heading: 'PPF Estimate', outputs: [['Total Contributions', 'ppfOriginal'], ['Estimated Interest', 'ppfInterest'], ['Estimated Maturity', 'ppfResult']] },
    { id: 'ssa', title: 'Sukanya Samriddhi', icon: 'fa-child-reaching', description: 'Estimate annual contributions, an assumed contribution period and overall maturity period.', inputs: [['Annual Contribution (₹)', 'ssaContribution', '100000'], ['Annual Interest Rate (%)', 'ssaRate', '8.2'], ['Contribution Years', 'ssaContributionYears', '15'], ['Maturity Years', 'ssaMaturityYears', '21']], heading: 'Sukanya Estimate', outputs: [['Total Contributions', 'ssaOriginal'], ['Estimated Interest', 'ssaInterest'], ['Estimated Maturity', 'ssaResult']] },
    { id: 'nps', title: 'NPS Calculator', icon: 'fa-user-clock', description: 'Estimate a retirement corpus using monthly contributions and an assumed annual return.', inputs: [['Monthly Contribution (₹)', 'npsMonthly', '5000'], ['Expected Return (%)', 'npsRate', '10'], ['Investment Years', 'npsYears', '25']], heading: 'NPS Corpus Estimate', outputs: [['Total Contribution', 'npsOriginal'], ['Estimated Growth', 'npsInterest'], ['Estimated Corpus', 'npsResult']] },
    { id: 'epf', title: 'EPF Calculator', icon: 'fa-briefcase', description: 'Estimate provident-fund accumulation from a monthly contribution and entered annual rate.', inputs: [['Monthly Contribution (₹)', 'epfMonthly', '5000'], ['Annual Interest Rate (%)', 'epfRate', '8'], ['Service Years', 'epfYears', '20']], heading: 'EPF Corpus Estimate', outputs: [['Total Contribution', 'epfOriginal'], ['Estimated Interest', 'epfInterest'], ['Estimated Corpus', 'epfResult']] },
    { id: 'swp', title: 'SWP Calculator', icon: 'fa-money-bill-transfer', description: 'Estimate corpus after a regular monthly withdrawal at an assumed return.', inputs: [['Starting Corpus (₹)', 'swpCorpus', '1000000'], ['Monthly Withdrawal (₹)', 'swpWithdrawal', '10000'], ['Expected Return (%)', 'swpRate', '8'], ['Withdrawal Years', 'swpYears', '10']], heading: 'SWP Estimate', outputs: [['Original Corpus', 'swpOriginal'], ['Total Withdrawals', 'swpWithdrawn'], ['Closing Corpus', 'swpResult']] },
    { id: 'compound', title: 'Compound Interest', icon: 'fa-percent', description: 'Estimate compound interest for a principal, rate, tenure and compounding frequency.', inputs: [['Principal Amount (₹)', 'compoundPrincipal', '100000'], ['Annual Interest Rate (%)', 'compoundRate', '8'], ['Compounds Per Year', 'compoundFrequency', '4'], ['Years', 'compoundYears', '10']], heading: 'Compound Interest Summary', outputs: [['Original Principal', 'compoundOriginal'], ['Interest Earned', 'compoundInterest'], ['Future Value', 'compoundResult']] },
    { id: 'inflation', title: 'Inflation Calculator', icon: 'fa-arrow-trend-up', description: 'Estimate how much a current expense or financial goal may cost in the future.', inputs: [['Current Amount (₹)', 'inflationAmount', '100000'], ['Expected Inflation (%)', 'inflationRate', '6'], ['Years', 'inflationYears', '10']], heading: 'Inflation Impact', outputs: [['Current Value', 'inflationOriginal'], ['Increase Due to Inflation', 'inflationIncrease'], ['Future Cost', 'inflationResult']] },
    { id: 'postoffice', title: 'Post Office Time Deposit', icon: 'fa-envelope-open-text', description: 'Estimate a time-deposit maturity value with quarterly compounding.', inputs: [['Deposit Amount (₹)', 'postofficePrincipal', '100000'], ['Annual Interest Rate (%)', 'postofficeRate', '7'], ['Tenure (Years)', 'postofficeYears', '5']], heading: 'Time Deposit Summary', outputs: [['Original Deposit', 'postofficeOriginal'], ['Estimated Interest', 'postofficeInterest'], ['Maturity Value', 'postofficeResult']] },
  ];

  const loanCalculatorSpecs = [
    ['homeLoan', 'Home Loan EMI', 'fa-house', 'Home Loan'],
    ['carLoan', 'Car Loan EMI', 'fa-car-side', 'Car Loan'],
    ['personalLoan', 'Personal Loan EMI', 'fa-user', 'Personal Loan'],
    ['businessLoan', 'Business Loan EMI', 'fa-briefcase', 'Business Loan'],
    ['educationLoan', 'Education Loan EMI', 'fa-user-graduate', 'Education Loan'],
    ['lapLoan', 'Loan Against Property', 'fa-building', 'Loan Against Property'],
    ['goldLoan', 'Gold Loan EMI', 'fa-gem', 'Gold Loan'],
    ['twoWheelerLoan', 'Two-Wheeler Loan EMI', 'fa-motorcycle', 'Two-Wheeler Loan'],
  ].map(([id, title, icon, loanLabel]) => ({
    id, title, icon, description: `Estimate the monthly EMI and total repayment for your ${loanLabel.toLowerCase()}.`,
    inputs: [[`${loanLabel} Amount (₹)`, `${id}Amount`, '500000'], ['Annual Interest Rate (%)', `${id}Rate`, '9'], ['Loan Tenure (Years)', `${id}Years`, '5']],
    heading: `${loanLabel} Repayment Summary`, outputs: [['Monthly EMI', `${id}Emi`], ['Original Principal', `${id}Principal`], ['Total Interest', `${id}Interest`], ['Total Repayment', `${id}Result`]],
  }));

  const calculatorContent = document.querySelector('.calculator-content');
  if (calculatorContent) {
    [...additionalCalculatorSpecs, ...loanCalculatorSpecs].forEach((spec) => {
      const section = document.createElement('section');
      section.id = spec.id;
      section.className = 'calculator-section';
      section.innerHTML = `<div class="container"><div class="calculator-box"><div class="calculator-left"><h2>${spec.title}</h2><p>${spec.description}</p>${spec.inputs.map(([label, inputId, placeholder]) => `<label>${label}</label><input type="number" id="${inputId}" placeholder="${placeholder}" min="0" step="0.01">`).join('')}<button id="calculate${spec.id[0].toUpperCase()}${spec.id.slice(1)}">Calculate</button></div><div class="calculator-right"><div class="result-box"><h3>${spec.heading}</h3><div class="summary">${spec.outputs.map(([label, outputId]) => `<p>${label}<span id="${outputId}">₹ 0</span></p>`).join('')}</div></div></div></div></div>`;
      calculatorContent.append(section);
    });
  }

  const annualDepositEstimate = (contribution, annualRate, contributionYears, maturityYears) => {
    let balance = 0;
    let deposited = 0;
    for (let year = 1; year <= maturityYears; year += 1) {
      if (year <= contributionYears) { balance += contribution; deposited += contribution; }
      balance *= 1 + annualRate;
    }
    return { balance, deposited };
  };
  const monthlyCorpusEstimate = (monthly, annualRate, years) => futureValueOfGrowingSip(monthly, annualRate / 1200, years * 12);

  onClick('calculateFd', () => {
    const principal = valueOf('fdPrincipal'); const rate = valueOf('fdRate') / 100; const years = valueOf('fdYears');
    if (principal <= 0 || rate < 0 || years <= 0) return;
    const value = principal * Math.pow(1 + rate / 4, years * 4); setText('fdOriginal', principal); setText('fdInterest', value - principal); setText('fdResult', value);
  });
  onClick('calculateRd', () => {
    const monthly = valueOf('rdMonthly'); const rate = valueOf('rdRate') / 1200; const years = valueOf('rdYears'); const months = years * 12;
    if (monthly <= 0 || rate < 0 || years <= 0) return;
    const value = rate === 0 ? monthly * months : monthly * ((Math.pow(1 + rate, months) - 1) / rate); const deposited = monthly * months; setText('rdOriginal', deposited); setText('rdInterest', value - deposited); setText('rdResult', value);
  });
  onClick('calculatePpf', () => {
    const contribution = valueOf('ppfContribution'); const rate = valueOf('ppfRate') / 100; const years = valueOf('ppfYears');
    if (contribution <= 0 || rate < 0 || years <= 0) return;
    const { balance, deposited } = annualDepositEstimate(contribution, rate, years, years); setText('ppfOriginal', deposited); setText('ppfInterest', balance - deposited); setText('ppfResult', balance);
  });
  onClick('calculateSsa', () => {
    const contribution = valueOf('ssaContribution'); const rate = valueOf('ssaRate') / 100; const contributionYears = valueOf('ssaContributionYears'); const maturityYears = valueOf('ssaMaturityYears');
    if (contribution <= 0 || rate < 0 || contributionYears <= 0 || maturityYears <= 0) return;
    const { balance, deposited } = annualDepositEstimate(contribution, rate, Math.min(contributionYears, maturityYears), maturityYears); setText('ssaOriginal', deposited); setText('ssaInterest', balance - deposited); setText('ssaResult', balance);
  });
  ['nps', 'epf'].forEach((type) => onClick(`calculate${type[0].toUpperCase()}${type.slice(1)}`, () => {
    const monthly = valueOf(`${type}Monthly`); const rate = valueOf(`${type}Rate`); const years = valueOf(`${type}Years`);
    if (monthly <= 0 || rate < 0 || years <= 0) return;
    const { futureValue, totalInvested } = monthlyCorpusEstimate(monthly, rate, years); setText(`${type}Original`, totalInvested); setText(`${type}Interest`, futureValue - totalInvested); setText(`${type}Result`, futureValue);
  }));
  onClick('calculateSwp', () => {
    const corpus = valueOf('swpCorpus'); const withdrawal = valueOf('swpWithdrawal'); const rate = valueOf('swpRate') / 1200; const months = valueOf('swpYears') * 12;
    if (corpus <= 0 || withdrawal < 0 || rate < 0 || months <= 0) return;
    let balance = corpus; let withdrawn = 0;
    for (let month = 0; month < months && balance > 0; month += 1) { balance *= 1 + rate; const payment = Math.min(withdrawal, balance); balance -= payment; withdrawn += payment; }
    setText('swpOriginal', corpus); setText('swpWithdrawn', withdrawn); setText('swpResult', balance);
  });
  onClick('calculateCompound', () => {
    const principal = valueOf('compoundPrincipal'); const rate = valueOf('compoundRate') / 100; const frequency = valueOf('compoundFrequency'); const years = valueOf('compoundYears');
    if (principal <= 0 || rate < 0 || frequency <= 0 || years <= 0) return;
    const value = principal * Math.pow(1 + rate / frequency, frequency * years); setText('compoundOriginal', principal); setText('compoundInterest', value - principal); setText('compoundResult', value);
  });
  onClick('calculateInflation', () => {
    const amount = valueOf('inflationAmount'); const rate = valueOf('inflationRate') / 100; const years = valueOf('inflationYears');
    if (amount <= 0 || rate < 0 || years <= 0) return;
    const value = amount * Math.pow(1 + rate, years); setText('inflationOriginal', amount); setText('inflationIncrease', value - amount); setText('inflationResult', value);
  });
  onClick('calculatePostoffice', () => {
    const principal = valueOf('postofficePrincipal'); const rate = valueOf('postofficeRate') / 100; const years = valueOf('postofficeYears');
    if (principal <= 0 || rate < 0 || years <= 0) return;
    const value = principal * Math.pow(1 + rate / 4, years * 4); setText('postofficeOriginal', principal); setText('postofficeInterest', value - principal); setText('postofficeResult', value);
  });
  loanCalculatorSpecs.forEach(({ id }) => onClick(`calculate${id[0].toUpperCase()}${id.slice(1)}`, () => {
    const principal = valueOf(`${id}Amount`); const annualRate = valueOf(`${id}Rate`); const years = valueOf(`${id}Years`);
    if (principal <= 0 || annualRate < 0 || years <= 0) return;
    const months = years * 12; const rate = annualRate / 1200;
    const emi = rate === 0 ? principal / months : principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    const total = emi * months; setText(`${id}Emi`, emi); setText(`${id}Principal`, principal); setText(`${id}Interest`, total - principal); setText(`${id}Result`, total);
  }));

  // Every financial tool shares one tabbed calculator workspace.
  const calculatorOrder = ['sip', 'lumpsum', 'emi', 'homeLoan', 'carLoan', 'personalLoan', 'businessLoan', 'educationLoan', 'lapLoan', 'goldLoan', 'twoWheelerLoan', 'fd', 'rd', 'ppf', 'ssa', 'nps', 'epf', 'swp', 'compound', 'inflation', 'postoffice', 'retirement', 'goal', 'tax', 'gst', 'hlv', 'education'];
  const calculatorMeta = {
    sip: ['SIP Calculator', 'fa-chart-line'], lumpsum: ['Lumpsum Calculator', 'fa-coins'], emi: ['EMI Calculator', 'fa-building-columns'],
    fd: ['Fixed Deposit', 'fa-building-columns'], rd: ['Recurring Deposit', 'fa-repeat'], ppf: ['PPF Calculator', 'fa-piggy-bank'],
    ssa: ['Sukanya Samriddhi', 'fa-child-reaching'], nps: ['NPS Calculator', 'fa-user-clock'], epf: ['EPF Calculator', 'fa-briefcase'],
    swp: ['SWP Calculator', 'fa-money-bill-transfer'], compound: ['Compound Interest', 'fa-percent'], inflation: ['Inflation Calculator', 'fa-arrow-trend-up'],
    postoffice: ['Post Office Time Deposit', 'fa-envelope-open-text'],
    homeLoan: ['Home Loan EMI', 'fa-house'], carLoan: ['Car Loan EMI', 'fa-car-side'], personalLoan: ['Personal Loan EMI', 'fa-user'], businessLoan: ['Business Loan EMI', 'fa-briefcase'],
    educationLoan: ['Education Loan EMI', 'fa-user-graduate'], lapLoan: ['Loan Against Property', 'fa-building'], goldLoan: ['Gold Loan EMI', 'fa-gem'], twoWheelerLoan: ['Two-Wheeler Loan EMI', 'fa-motorcycle'],
    retirement: ['Retirement Planner', 'fa-user-clock'], goal: ['Goal Planner', 'fa-bullseye'], tax: ['Income Tax', 'fa-file-invoice-dollar'],
    gst: ['GST Calculator', 'fa-percent'], hlv: ['Human Life Value', 'fa-shield-heart'], education: ['Child Education', 'fa-user-graduate'],
  };
  const calculatorEntries = calculatorOrder.map((id) => ({ id, section: document.getElementById(id) })).filter(({ section }) => section?.querySelector('.calculator-box'));
  const initialEntry = calculatorEntries.find(({ id }) => id === 'sip');
  if (initialEntry) {
    const calculatorStudio = document.createElement('div');
    calculatorStudio.className = 'calculator-studio';
    calculatorStudio.innerHTML = '<div class="calculator-studio-tabs" role="tablist" aria-label="Financial calculators"></div><div class="calculator-studio-panel"></div>';
    initialEntry.section.parentElement.insertBefore(calculatorStudio, initialEntry.section);
    const tabs = calculatorStudio.querySelector('.calculator-studio-tabs');
    const panel = calculatorStudio.querySelector('.calculator-studio-panel');
    const boxes = new Map();

    calculatorEntries.forEach(({ id, section }, index) => {
      const box = section.querySelector('.calculator-box');
      const directResult = box.querySelector(':scope > .result-box');
      if (directResult) directResult.classList.add('calculator-right');
      box.dataset.calculatorPanel = id;
      box.hidden = index !== 0;
      boxes.set(id, box);
      panel.append(box);
      const [label, icon] = calculatorMeta[id];
      const tab = document.createElement('button');
      tab.className = `calculator-studio-tab${index === 0 ? ' active' : ''}`;
      tab.type = 'button';
      tab.dataset.calculatorMode = id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(index === 0));
      tab.innerHTML = `<i class="fa-solid ${icon}"></i><span>${label}</span>`;
      tabs.append(tab);
      section.remove();
    });

    const selectCalculator = (id) => {
      if (!boxes.has(id)) return;
      boxes.forEach((box, boxId) => { box.hidden = boxId !== id; });
      tabs.querySelectorAll('.calculator-studio-tab').forEach((tab) => {
        const active = tab.dataset.calculatorMode === id;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
    };
    tabs.querySelectorAll('.calculator-studio-tab').forEach((tab) => tab.addEventListener('click', () => selectCalculator(tab.dataset.calculatorMode)));

    const sidebarList = document.querySelector('.calculator-sidebar ul');
    calculatorOrder.forEach((id) => {
      if (!sidebarList || sidebarList.querySelector(`[href="#${id}"]`)) return;
      const [label, icon] = calculatorMeta[id];
      sidebarList.insertAdjacentHTML('beforeend', `<li><a href="#${id}"><i class="fa-solid ${icon}"></i> ${label}</a></li>`);
    });
    document.querySelectorAll('.calculator-sidebar a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const id = link.getAttribute('href').slice(1);
        if (!boxes.has(id)) return;
        event.preventDefault();
        selectCalculator(id);
        calculatorStudio.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

})();
