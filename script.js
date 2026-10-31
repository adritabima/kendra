window.__fullPageTranslator = true;

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const iconStyles = document.createElement('link');
        iconStyles.rel = 'stylesheet';
        iconStyles.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css';
        document.head.appendChild(iconStyles);
    }

    document.querySelectorAll('.brand-logo').forEach((logo) => {
        logo.src = 'Adrita Bima Logo.jpeg';
        logo.alt = 'Adrita Bima Kendra logo';
    });

    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    if (!document.querySelector('.brand-logo')) {
        const compactHeader = document.createElement('header');
        compactHeader.className = 'logo-only-header';
        compactHeader.innerHTML = `
            <div class="container logo-only-header-inner">
                <a class="logo" href="index.html" aria-label="Adrita Bima Kendra home">
                    <img class="brand-logo" src="Adrita Bima Logo.jpeg" alt="Adrita Bima Kendra logo">
                    <h2><span>ADRITA</span> BIMA KENDRA</h2>
                </a>
                <a class="logo-only-contact" href="contact.html">Contact Us</a>
            </div>
        `;
        document.body.prepend(compactHeader);
    }

    const footerPages = new Set(['market.html', 'faq.html', 'login.html', 'investment.html']);
    if (footerPages.has(currentPage)) {
        const existingFooter = document.querySelector('footer');
        const marketWatchlist = existingFooter?.querySelector('.watchlist');
        if (marketWatchlist) existingFooter.before(marketWatchlist);
        if (existingFooter) existingFooter.remove();

        const sharedFooter = document.createElement('footer');
        sharedFooter.className = 'shared-site-footer';
        sharedFooter.innerHTML = `
            <div class="container footer-grid">
                <div><h2>Adrita Bima Kendra</h2><p>Your trusted financial partner for Insurance, Mutual Funds, Wealth Management, Income Tax &amp; GST Services.</p></div>
                <div><h3>Quick Links</h3><ul><li><a href="index.html">Home</a></li><li><a href="about.html">About</a></li><li><a href="services.html">Services</a></li><li><a href="gallery.html">Gallery</a></li><li><a href="contact.html">Contact</a></li></ul></div>
                <div><h3>Our Services</h3><ul><li>Life Insurance</li><li>Mutual Funds</li><li>Health Insurance</li><li>Income Tax</li><li>GST Services</li></ul></div>
                <div><h3>Office</h3><p><i class="fa-solid fa-location-dot"></i> Khalna, Hatpara Bazar, Howrah</p><p><i class="fa-solid fa-phone"></i> 9474862701</p><p><i class="fa-solid fa-envelope"></i> adritabimakendra@gmail.com</p></div>
            </div>
            <div class="copyright">&copy; 2026 Adrita Bima Kendra. All Rights Reserved. Powered by <a href="https://www.banisatya.com/" target="_blank" rel="noopener noreferrer">Banisatya Wealth Pvt Ltd</a>.</div>
        `;
        const firstScript = Array.from(document.body.children).find((element) => element.tagName === 'SCRIPT');
        document.body.insertBefore(sharedFooter, firstScript || null);
    }

    // Shared site language control. The selected language is remembered while visitors move between pages.
    const languageCopy = {
        'Home': ['होम', 'হোম'],
        'About': ['हमारे बारे में', 'আমাদের সম্পর্কে'],
        'About Us': ['हमारे बारे में', 'আমাদের সম্পর্কে'],
        'Services': ['सेवाएं', 'পরিষেবাসমূহ'],
        'Our Services': ['हमारी सेवाएं', 'আমাদের পরিষেবাসমূহ'],
        'Market': ['मार्केट', 'বাজার'],
        'Calculator': ['कैलकुलेटर', 'ক্যালকুলেটর'],
        'FAQ': ['सामान्य प्रश्न', 'সাধারণ প্রশ্ন'],
        'Contact': ['संपर्क', 'যোগাযোগ'],
        'Contact Us': ['हमसे संपर्क करें', 'আমাদের সাথে যোগাযোগ করুন'],
        'Login': ['लॉग इन', 'लগ ইন'],
        'Gallery': ['गैलरी', 'গ্যালারি'],
        'WHO WE ARE': ['हम कौन हैं', 'আমরা কারা'],
        'OUR PURPOSE': ['हमारा उद्देश्य', 'আমাদের উদ্দেশ্য'],
        'Mission • Vision • Values': ['मिशन • विज़न • मूल्यों', 'মিশন • ভিশন • মূল্যবোধ'],
        'Mission': ['मिशन', 'মিশন'],
        'Vision': ['दृष्टि', 'ভিশন'],
        'Core Values': ['मुख्य मूल्य', 'মূল মূল্যবোধ'],
        'Integrity, Trust, Transparency, Customer Satisfaction and Long-Term Relationships.': ['ईमानदारी, भरोसा, पारदर्शिता, ग्राहक संतुष्टि और दीर्घकालिक संबंध।', 'নিষ্ঠা, বিশ্বাস, স্বচ্ছতা, গ্রাহক সন্তুষ্টি ও দীর্ঘমেয়াদী সম্পর্ক।'],
        'WHAT WE OFFER': ['हम क्या प्रदान करते हैं', 'আমরা কী দিই'],
        'Helping you protect, grow and manage your wealth.': ['हम आपको आपके धन की रक्षा, वृद्धि और प्रबंधन में मदद करते हैं।', 'আমরা আপনাকে আপনার সম্পদ রক্ষা, বাড়ানো ও পরিচালনা করতে সহায়তা করি।'],
        'Retirement Planning': ['सेवानिवृत्ति योजना', 'অবসর পরিকল্পনা'],
        'Adrita Bima Kendra': ['अद्रिता बीमा केंद्र', 'অদ্রিতা বিমা কেন্দ্র'],
        'Office Address': ['कार्यालय का पता', 'অফিসের ঠিকানা'],
        'Call Us': ['हमें कॉल करें', 'আমাদের ফোন করুন'],
        'Email Us': ['हमें ईमेल करें', 'আমাদের ইমেল করুন'],
        'Working Hours': ['कार्य समय', 'কর্মঘণ্টা'],
        'Monday – Saturday': ['सोमवार – शनिवार', 'সোমবার – শনিবার'],
        '9:30 AM – 7:00 PM': ['9:30 AM – 7:00 PM', '9:30 AM – 7:00 PM'],
        'We are ready to help with insurance, mutual funds, loans and financial planning.': ['हम बीमा, म्यूचुअल फंड, ऋण और वित्तीय योजना में आपकी मदद के लिए तैयार हैं।', 'আমরা বিমা, মিউচুয়াল ফান্ড, ঋণ ও আর্থিক পরিকল্পনায় আপনাকে সাহায্য করতে প্রস্তুত।'],
        'Send Us a Message': ['हमें संदेश भेजें', 'আমাদের বার্তা পাঠান'],
        'We usually respond within one business day.': ['हम आमतौर पर एक व्यावसायिक दिन के भीतर उत्तर देते हैं।', 'আমরা সাধারণত এক কর্মদিবসের মধ্যে উত্তর দিই।'],
        'Find Our Office': ['हमारा कार्यालय खोजें', 'আমাদের অফিস খুঁজুন'],
        'Our Company': ['हमारी कंपनी', 'আমাদের কোম্পানি'],
        'Areas We Serve': ['हम जिस क्षेत्र में सेवा देते हैं', 'আমরা যে এলাকায় সেবা দিই'],
        'Quick Questions': ['त्वरित प्रश्न', 'দ্রুত প্রশ্ন'],
        'Which documents might I need?': ['मुझे कौन-से दस्तावेज़ चाहिए होंगे?', 'আমাকে কোন নথিপত্র লাগতে পারে?'],
        'The required documents depend on the service. Send us a WhatsApp message and we will guide you.': ['आवश्यक दस्तावेज़ सेवा पर निर्भर करते हैं। हमें व्हाट्सऐप पर संदेश भेजें, हम आपको मार्गदर्शन करेंगे।', 'প্রয়োজনীয় নথিপত্র পরিষেবার উপর নির্ভর করে। আমাদের হোয়াটসঅ্যাপে বার্তা পাঠান, আমরা আপনাকে নির্দেশ দেব।'],
        'Can I get help choosing an insurance plan?': ['क्या मुझे बीमा योजना चुनने में मदद मिल सकती है?', 'আমি কি বীমা পরিকল্পনা বেছে নিতে সাহায্য পেতে পারি?'],
        'Yes. Our team can help you understand suitable insurance and investment options.': ['हाँ। हमारी टीम आपको उपयुक्त बीमा और निवेश विकल्प समझने में मदद कर सकती है।', 'হ্যাঁ। আমাদের টিম আপনাকে উপযুক্ত বীমা ও বিনিয়োগ বিকল্প বুঝতে সাহায্য করতে পারে।'],
        'Can I book an appointment?': ['क्या मैं अपॉइंटमेंट बुक कर सकता हूँ?', 'আমি কি অ্যাপয়েন্টমেন্ট বুক করতে পারি?'],
        'Yes. Use the WhatsApp form above or call us during working hours.': ['हाँ। ऊपर दिए गए व्हाट्सऐप फॉर्म का उपयोग करें या कार्य समय के दौरान हमें कॉल करें।', 'হ্যাঁ। উপরের হোয়াটসঅ্যাপ ফর্ম ব্যবহার করুন বা কর্মঘণ্টার সময় আমাদের ফোন করুন।'],
        'PLAN • CALCULATE • GROW': ['योजना • गणना • वृद्धि', 'পরিকল্পনা • গণনা • বৃদ্ধি'],
        'TOOLS': ['उपकरण', 'টুলস'],
        'Professional Financial Calculators': ['पेशेवर वित्तीय कैलकुलेटर', 'পেশাদার আর্থিক ক্যালকুলেটর'],
        'Use clear, growth-based estimates for savings, investments, loans and life goals.': ['बचत, निवेश, ऋण और जीवन लक्ष्यों के लिए स्पष्ट, वृद्धि-आधारित आकलन का उपयोग करें।', 'সঞ্চয়, বিনিয়োগ, ঋণ ও জীবনের লক্ষ্যগুলির জন্য স্পষ্ট, বৃদ্ধির ওপর ভিত্তি করে গণনা ব্যবহার করুন।'],
        'Start Calculating': ['गणना शुरू करें', 'গণনা শুরু করুন'],
        'Investment and goal tools use compound-growth estimates. The original amount, total contribution and estimated growth are shown separately wherever applicable.': ['निवेश और लक्ष्य उपकरण चक्रवृद्धि वृद्धि का अनुमान उपयोग करते हैं। मूल राशि, कुल योगदान और अनुमानित वृद्धि जहाँ भी लागू हो अलग-अलग दिखाए जाते हैं।', 'বিনিয়োগ ও লক্ষ্য টুলস যৌগিক বৃদ্ধির অনুমান ব্যবহার করে। মূল পরিমাণ, মোট অবদান ও আনুমানিক বৃদ্ধিকে যেখানে প্রযোজ্য সেখানে আলাদা করে দেখানো হয়।'],
        'SIP Calculator': ['SIP कैलकुलेटर', 'SIP ক্যালকুলেটর'],
        'Estimate your future wealth by investing monthly.': ['मासिक निवेश से अपने भविष्य की संपत्ति का अनुमान लगाएँ।', 'মাসিক বিনিয়োগ দিয়ে আপনার ভবিষ্যতের সম্পদ অনুমান করুন।'],
        'Monthly Investment (₹)': ['मासिक निवेश (₹)', 'মাসিক বিনিয়োগ (₹)'],
        'Expected Return (%)': ['अपेक्षित रिटर्न (%)', 'আনুমানিক রিটার্ন (%)'],
        'Investment Period (Years)': ['निवेश अवधि (वर्ष)', 'বিনিয়োগের সময়কাল (বছর)'],
        'Annual SIP Increase (%)': ['वार्षिक SIP वृद्धि (%)', 'বার্ষিক SIP বৃদ্ধি (%)'],
        'Calculate SIP': ['SIP गणना करें', 'SIP গণনা করুন'],
        'Investment Summary': ['निवेश सारांश', 'বিনিয়োগের সংক্ষিপ্তসার'],
        'Manage your service requests and stay connected with our team through a secure client portal.': ['सुरक्षित क्लाइंट पोर्टल के माध्यम से अपनी सेवा अनुरोध प्रबंधित करें और हमारी टीम से जुड़ें।', 'সুরক্ষিত ক্লায়েন্ট পোর্টালের মাধ্যমে আপনার পরিষেবা অনুরোধ পরিচালনা করুন এবং আমাদের টিমের সাথে যুক্ত থাকুন।'],
        'Request Your Access': ['अपना एक्सेस अनुरोध करें', 'আপনার ব্যবহারের অনুরোধ করুন'],
        'Enter your details and we will help you with portal access.': ['अपना विवरण लिखें, हम vám को पोर्टल एक्सेस में सहायता करेंगे।', 'আপনার বিবরণ লিখুন, আমরা পোর্টাল অ্যাকসেসে আপনাকে সহায়তা করব।'],
        'Request on WhatsApp': ['व्हाट्सऐप पर अनुरोध करें', 'হোয়াটসঅ্যাপে অনুরোধ করুন'],
        'Need immediate help?': ['तुरंत मदद चाहिए?', 'তাৎক্ষণিক সহায়তা দরকার?'],
        'Back to Home': ['होम पर वापस जाएँ', 'হোমে ফিরে যান'],
        'Which services do you provide?': ['आप कौन-कौन सी सेवाएँ देते हैं?', 'আপনি কী কী পরিষেবা দেন?'],
        'Insurance, investment, tax planning and financial guidance.': ['बीमा, निवेश, कर योजना और वित्तीय मार्गदर्शन।', 'বীমা, বিনিয়োগ, ট্যাক্স পরিকল্পনা ও আর্থিক পরামর্শ।'],
        'How can I book an appointment?': ['मैं अपॉइंटमेंट कैसे बुक कर सकता हूँ?', 'আমি কিভাবে অ্যাপয়েন্টমেন্ট বুক করতে পারি?'],
        'Call +91 94748 62701 or visit our contact page.': ['+91 94748 62701 पर कॉल करें या हमारी संपर्क पृष्ठ पर जाएँ।', '+91 94748 62701 নম্বরে কল করুন অথবা আমাদের যোগাযোগ পৃষ্ঠায় যান।'],
        'Our gallery is being updated with new photos and client events.': ['हमारी गैलरी नए फोटो और क्लाइंट इवेंट्स के साथ अपडेट की जा रही है।', 'আমাদের গ্যালারি নতুন ছবি ও ক্লায়েন্ট ইভেন্টের সঙ্গে আপডেট হচ্ছে।'],
        'Live Market Centre': ['लाइव मार्केट सेंटर', 'লাইভ মার্কেট সেন্টার'],
        'Live market updates for NIFTY, SENSEX, commodities, forex and charts.': ['NIFTY, SENSEX, कमोडिटीज़, फॉरेक्स और चार्ट के लिए लाइव मार्केट अपडेट।', 'NIFTY, SENSEX, কমোডিটি, ফরেক্স ও চার্টের লাইভ বাজার আপডেট।'],
        'We are ready to help with insurance, mutual funds, loans and financial planning.': ['हम बीमा, म्यूचुअल फंड, ऋण और वित्तीय योजना में आपकी मदद के लिए तैयार हैं।', 'আমরা বিমা, মিউচুয়াল ফান্ড, ঋণ ও আর্থিক পরিকল্পনায় আপনাকে সাহায্য করতে প্রস্তুত।'],
        'Book Appointment': ['अपॉइंटमेंट बुक करें', 'অ্যাপয়েন্টমেন্ট বুক করুন'],
        'Book a FREE Consultation': ['निःशुल्क परामर्श बुक करें', 'বিনামূল্যে পরামর্শ বুক করুন'],
        'Request on WhatsApp': ['व्हाट्सऐप पर अनुरोध करें', 'হোয়াটসঅ্যাপে অনুরোধ করুন'],
        'Get Guidance': ['मार्गदर्शन प्राप्त करें', 'নির্দেশনা পান'],
        'View Live Market': ['लाइव मार्केट देखें', 'লাইভ মার্কেট দেখুন'],
        'Market Status': ['मार्केट स्थिति', 'বাজারের অবস্থা'],
        'OPEN': ['खुला', 'খোলা'],
        'Market Cap': ['मार्केट कैप', 'মার্কেট ক্যাপ'],
        'India VIX': ['इंडिया VIX', 'ইন্ডিয়া VIX'],
        'Advance / Decline': ['एडवांस / डिक्लाइन', 'অ্যাডভান্স / ডিক্লাইন'],
        'Positive Breadth': ['सकारात्मक प्रसार', 'পজিটিভ ব্রেডথ'],
        'Connecting to live quote service…': ['लाइव कोट सेवा से कनेक्ट हो रहा है…', 'লাইভ কোট পরিষেবার সাথে সংযোগ হচ্ছে…'],
        'Live Market Overview': ['लाइव मार्केट ओवरव्यू', 'লাইভ মার্কেট ওভারভিউ'],
        'Live prices refresh automatically from TradingView.': ['ट्रेडिंगव्यू से लाइव कीमतें अपने आप अपडेट होती रहती हैं।', 'ট্রেডিংভিউ থেকে লাইভ দাম স্বয়ংক্রিয়ভাবে রিফ্রেশ হয়।']
    };
    /* Legacy translation entries retained for reference:
        'Book Appointment': ['अपॉइंटमेंट बुक करें', 'অ্যাপয়েন্টমেন্ট বুক করুন'],
        'Book a FREE Consultation': ['निःशुल्क परामर्श बुक करें', 'বিনামূল্যে পরামর্শ বুক করুন'],
        'Get Started': ['शुरू करें', 'শুরু করুন'],
        'Learn More': ['और जानें', 'আরও জানুন'],
        'Read More': ['और पढ़ें', 'আরও পড়ুন'],
        'Welcome To': ['आपका स्वागत है', 'স্বাগতম'],
        'Your Trusted Financial Partner': ['आपका विश्वसनीय वित्तीय साथी', 'আপনার বিশ্বস্ত আর্থিক সঙ্গী'],
        'Insurance • Mutual Funds • Income Tax • GST • Loans • Wealth Management': ['बीमा • म्यूचुअल फंड • आयकर • जीएसटी • ऋण • वेल्थ मैनेजमेंट', 'বিমা • মিউচুয়াল ফান্ড • আয়কর • জিএসটি • ঋণ • সম্পদ ব্যবস্থাপনা'],
        'Need Expert Financial Advice?': ['विशेषज्ञ वित्तीय सलाह चाहिए?', 'বিশেষজ্ঞ আর্থিক পরামর্শ প্রয়োজন?'],
        'Book a FREE consultation today.': ['आज ही निःशुल्क परामर्श बुक करें।', 'আজই বিনামূল্যে পরামর্শ বুক করুন।'],
        'Let’s Secure Your Financial Future': ['आइए आपका वित्तीय भविष्य सुरक्षित करें', 'আসুন আপনার আর্থিক ভবিষ্যৎ সুরক্ষিত করি'],
        'Schedule a Free Consultation': ['निःशुल्क परामर्श तय करें', 'বিনামূল্যে পরামর্শ নির্ধারণ করুন'],
        'Why Choose Us': ['हमें क्यों चुनें', 'কেন আমাদের বেছে নেবেন'],
        'What Our Clients Say': ['हमारे ग्राहक क्या कहते हैं', 'আমাদের গ্রাহকরা কী বলেন'],
        'Happy Clients': ['संतुष्ट ग्राहक', 'সন্তুষ্ট গ্রাহক'],
        'Years of Experience': ['वर्षों का अनुभव', 'বছরের অভিজ্ঞতা'],
        'Policies Served': ['सेवा की गई पॉलिसियां', 'পরিষেবাকৃত পলিসি'],
        'Client Satisfaction': ['ग्राहक संतुष्टि', 'গ্রাহক সন্তুষ্টি'],
        'Send Message': ['संदेश भेजें', 'বার্তা পাঠান'],
        'Send on WhatsApp': ['व्हाट्सऐप पर भेजें', 'হোয়াটসঅ্যাপে পাঠান'],
        'Start Your Enquiry': ['अपनी पूछताछ शुरू करें', 'আপনার অনুসন্ধান শুরু করুন'],
        'Send your details directly to us on WhatsApp.': ['अपनी जानकारी सीधे हमें व्हाट्सऐप पर भेजें।', 'আপনার তথ্য সরাসরি হোয়াটসঅ্যাপে আমাদের পাঠান।'],
        'Quick Links': ['त्वरित लिंक', 'দ্রুত লিঙ্ক'],
        'Office': ['कार्यालय', 'অফিস'],
        'Life Insurance': ['जीवन बीमा', 'জীবন বিমা'],
        'Health Insurance': ['स्वास्थ्य बीमा', 'স্বাস্থ্য বিমা'],
        'Mutual Funds': ['म्यूचुअल फंड', 'মিউচুয়াল ফান্ড'],
        'Income Tax': ['आयकर', 'আয়কর'],
        'GST Services': ['जीएसटी सेवाएं', 'জিএসটি পরিষেবা'],
        'Financial Calculators': ['वित्तीय कैलकुलेटर', 'আর্থিক ক্যালকুলেটর'],
        'Live Market': ['लाइव मार्केट', 'লাইভ মার্কেট'],
        'Latest Financial News': ['नवीनतम वित्तीय समाचार', 'সর্বশেষ আর্থিক খবর'],
        'Indian Stock Market Dashboard': ['भारतीय शेयर बाजार डैशबोर्ड', 'ভারতীয় শেয়ার বাজার ড্যাশবোর্ড'],
        'Top Gainers': ['सबसे अधिक बढ़ने वाले', 'সবচেয়ে বেশি বাড়া শেয়ার'],
        'Top Losers': ['सबसे अधिक गिरने वाले', 'সবচেয়ে বেশি কমা শেয়ার'],
        'Market Heatmap': ['मार्केट हीटमैप', 'বাজার হিটম্যাপ'],
        'My Watchlist': ['मेरी वॉचलिस्ट', 'আমার ওয়াচলিস্ট'],
        'Complete Financial Solutions': ['संपूर्ण वित्तीय समाधान', 'সম্পূর্ণ আর্থিক সমাধান'],
        'Retirement Planning': ['सेवानिवृत्ति योजना', 'অবসর পরিকল্পনা'],
        'Loans': ['ऋण', 'ঋণ'],
        'Fixed Deposits': ['फिक्स्ड डिपॉजिट', 'স্থায়ী আমানত'],
        'Wealth Management': ['वेल्थ मैनेजमेंट', 'সম্পদ ব্যবস্থাপনা'],
        'Get In Touch': ['संपर्क करें', 'যোগাযোগ করুন'],
        'Send Us a Message': ['हमें संदेश भेजें', 'আমাদের একটি বার্তা পাঠান'],
        'Find Our Office': ['हमारा कार्यालय खोजें', 'আমাদের অফিস খুঁজুন'],
        'Our Company': ['हमारी कंपनी', 'আমাদের কোম্পানি'],
        'Director': ['निदेशक', 'পরিচালক'],
        'Service Manager': ['सेवा प्रबंधक', 'সার্ভিস ম্যানেজার'],
        'Financial Advisor': ['वित्तीय सलाहकार', 'আর্থিক উপদেষ্টা'],
        'Full Name': ['पूरा नाम', 'পুরো নাম'],
        'Email Address': ['ईमेल पता', 'ইমেল ঠিকানা'],
        'Mobile Number': ['मोबाइल नंबर', 'মোবাইল নম্বর'],
        'Message': ['संदेश', 'বার্তা'],
        'Calculate': ['गणना करें', 'হিসাব করুন'],
        'Reset': ['रीसेट', 'রিসেট'],
        'Results': ['परिणाम', 'ফলাফল'],
        'Back to Home': ['होम पर वापस जाएं', 'হোমে ফিরে যান'],
        'Request Your Access': ['अपनी पहुँच का अनुरोध करें', 'আপনার অ্যাক্সেসের অনুরোধ করুন'],
        'Client Portal Access': ['क्लाइंट पोर्टल एक्सेस', 'ক্লায়েন্ট পোর্টাল অ্যাক্সেস'],
        'Adrita Bima Kendra': ['अद्रिता बीमा केंद्र', 'অদ্রিতা বিমা কেন্দ্র'],
        'Your trusted financial partner for Insurance, Mutual Funds, Wealth Management, Income Tax & GST Services.': ['बीमा, म्यूचुअल फंड, वेल्थ मैनेजमेंट, आयकर और जीएसटी सेवाओं के लिए आपका विश्वसनीय वित्तीय साथी।', 'বিমা, মিউচুয়াল ফান্ড, সম্পদ ব্যবস্থাপনা, আয়কর ও জিএসটি পরিষেবায় আপনার বিশ্বস্ত আর্থিক সঙ্গী।'],
        'All Rights Reserved.': ['सर्वाधिकार सुरक्षित।', 'সর্বস্বত্ব সংরক্ষিত।']
    };
    */

    const languageNames = { en: 'English', hi: 'हिंदी', bn: 'বাংলা' };
    const languageIndex = { hi: 0, bn: 1 };
    const originalTextNodes = new WeakMap();
    const translateText = (text, language) => {
        if (language === 'en') return text;
        const start = text.match(/^\s*/)[0];
        const end = text.match(/\s*$/)[0];
        const clean = text.trim();
        const translated = languageCopy[clean]?.[languageIndex[language]];
        return translated ? `${start}${translated}${end}` : text;
    };
    const translatePage = (language) => {
        document.documentElement.lang = language;
        document.documentElement.dataset.language = language;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                const parent = node.parentElement;
                return parent && !['SCRIPT', 'STYLE', 'OPTION'].includes(parent.tagName) && node.nodeValue.trim()
                    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach((node) => {
            const original = originalTextNodes.get(node) || node.nodeValue;
            if (languageCopy[original.trim()]) {
                originalTextNodes.set(node, original);
                node.nodeValue = translateText(original, language);
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((input) => {
            input.placeholder = translateText(input.dataset.i18nPlaceholder, language);
        });
    };

    // Keep one clean menu everywhere; old Market markup contained a duplicate menu.
    const navbarMenus = Array.from(document.querySelectorAll('.navbar .menu'));
    navbarMenus.slice(1).forEach((menu) => menu.remove());

    // Remove old hard-coded dropdowns so only the shared, working selector remains.
    document.querySelectorAll('.lang-item').forEach((item) => item.remove());

    const selector = document.querySelector('#siteLanguageSelector') || document.createElement('div');
    selector.id = 'siteLanguageSelector';
    selector.className = 'language-selector';
    selector.title = 'Choose language';
    selector.innerHTML = `<i class="fa-solid fa-language" aria-hidden="true"></i><span class="sr-only">Choose language</span><select class="site-language-select" aria-label="Choose language"><option value="en">English</option><option value="hi">Hindi</option><option value="bn">Bengali</option></select>`;
    const menu = document.querySelector('.navbar .menu');
    if (menu) {
        let languageMenuItem = menu.querySelector('.language-menu-item');
        if (!languageMenuItem) {
            languageMenuItem = document.createElement('li');
            languageMenuItem.className = 'language-menu-item';
            let loginMenuItem = menu.querySelector('a[href="login.html"]')?.closest('li');
            if (!loginMenuItem) {
                loginMenuItem = document.createElement('li');
                loginMenuItem.innerHTML = '<a href="login.html">Login</a>';
                menu.appendChild(loginMenuItem);
            }
            loginMenuItem.after(languageMenuItem);
        }
        selector.classList.remove('language-selector-floating');
        languageMenuItem.appendChild(selector);
    } else {
        selector.classList.add('language-selector-floating');
        document.body.appendChild(selector);
    }
    const siteLanguageSelect = selector.querySelector('.site-language-select');
    const translationCachePrefix = 'adrita-google-translation:';
    let translationRun = 0;
    const requestGoogleTranslation = async (value, language) => {
        const cacheKey = `${translationCachePrefix}${language}:${value}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) return cached;
        const url = new URL('https://translate.googleapis.com/translate_a/single');
        url.search = new URLSearchParams({ client: 'gtx', sl: 'en', tl: language, dt: 't', q: value }).toString();
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Google Translate request failed');
        const data = await response.json();
        const translated = data?.[0]?.map((part) => part[0]).join('') || value;
        sessionStorage.setItem(cacheKey, translated);
        return translated;
    };
    const translateEntirePage = async (language) => {
        const currentRun = ++translationRun;
        document.documentElement.lang = language;
        const textNodes = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                const parent = node.parentElement;
                const excluded = ['SCRIPT', 'STYLE', 'OPTION', 'I', 'SVG'];
                return parent && node.nodeValue.trim() && !excluded.includes(parent.tagName) && !parent.closest('.language-selector')
                    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        const entries = textNodes.map((node) => {
            const original = originalTextNodes.get(node) || node.nodeValue;
            originalTextNodes.set(node, original);
            return { node, original };
        });
        const inputs = Array.from(document.querySelectorAll('input[placeholder], textarea[placeholder]'));
        inputs.forEach((input) => { input.dataset.googleOriginalPlaceholder ||= input.placeholder; });
        const labelledElements = Array.from(document.querySelectorAll('[title], img[alt], [aria-label]'))
            .filter((element) => !element.closest('.language-selector'));
        labelledElements.forEach((element) => {
            ['title', 'alt', 'aria-label'].forEach((attribute) => {
                if (!element.hasAttribute(attribute)) return;
                const key = `googleOriginal${attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}`;
                element.dataset[key] ||= element.getAttribute(attribute);
            });
        });
        if (language === 'en') {
            entries.forEach(({ node, original }) => { node.nodeValue = original; });
            inputs.forEach((input) => { input.placeholder = input.dataset.googleOriginalPlaceholder; });
            labelledElements.forEach((element) => {
                ['title', 'alt', 'aria-label'].forEach((attribute) => {
                    const key = `googleOriginal${attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}`;
                    if (element.dataset[key]) element.setAttribute(attribute, element.dataset[key]);
                });
            });
            return;
        }
        selector.classList.add('is-translating');
        siteLanguageSelect.disabled = true;
        const jobs = entries.map(({ node, original }) => async () => {
            const leading = original.match(/^\s*/)[0];
            const trailing = original.match(/\s*$/)[0];
            const translated = await requestGoogleTranslation(original.trim(), language);
            if (currentRun === translationRun) node.nodeValue = `${leading}${translated}${trailing}`;
        });
        inputs.forEach((input) => jobs.push(async () => {
            const translated = await requestGoogleTranslation(input.dataset.googleOriginalPlaceholder, language);
            if (currentRun === translationRun) input.placeholder = translated;
        }));
        labelledElements.forEach((element) => {
            ['title', 'alt', 'aria-label'].forEach((attribute) => {
                const key = `googleOriginal${attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}`;
                if (!element.dataset[key]) return;
                jobs.push(async () => {
                    const translated = await requestGoogleTranslation(element.dataset[key], language);
                    if (currentRun === translationRun) element.setAttribute(attribute, translated);
                });
            });
        });
        let nextJob = 0;
        const worker = async () => {
            while (nextJob < jobs.length) {
                const job = jobs[nextJob++];
                try { await job(); } catch (error) { console.warn('A page label could not be translated.', error); }
            }
        };
        await Promise.all(Array.from({ length: 6 }, worker));
        if (currentRun === translationRun) {
            siteLanguageSelect.disabled = false;
            selector.classList.remove('is-translating');
        }
    };
    const getStoredLanguage = () => localStorage.getItem('siteLanguage') || localStorage.getItem('adrita-language') || 'en';
    const setStoredLanguage = (language) => {
        localStorage.setItem('siteLanguage', language);
        localStorage.setItem('adrita-language', language);
    };
    const savedLanguage = getStoredLanguage();
    let activeLanguage = savedLanguage;
    siteLanguageSelect.value = savedLanguage;
    siteLanguageSelect.addEventListener('change', async () => {
        const language = siteLanguageSelect.value;
        activeLanguage = language;
        setStoredLanguage(language);
        await translateEntirePage(language);
    });

    document.querySelectorAll('.whatsapp, #scrollTop').forEach((element) => element.remove());

    const floatingActions = document.createElement('div');
    floatingActions.className = 'floating-actions';
    floatingActions.innerHTML = `
        <a class="floating-call" href="tel:+919474862701" aria-label="Call Adrita Bima Kendra"><i class="fa-solid fa-phone"></i></a>
        <button class="floating-whatsapp" type="button" aria-label="Open WhatsApp enquiry form"><i class="fa-brands fa-whatsapp"></i></button>
    `;
    document.body.appendChild(floatingActions);

    const modal = document.createElement('div');
    modal.className = 'whatsapp-enquiry-modal';
    modal.hidden = true;
    modal.innerHTML = `
        <div class="whatsapp-enquiry-dialog" role="dialog" aria-modal="true" aria-labelledby="whatsappEnquiryTitle">
            <button class="whatsapp-modal-close" type="button" aria-label="Close enquiry form">&times;</button>
            <div class="whatsapp-modal-heading"><i class="fa-brands fa-whatsapp"></i><div><h2 id="whatsappEnquiryTitle">Start Your Enquiry</h2><p>Send your details directly to us on WhatsApp.</p></div></div>
            <form id="whatsappModalForm" novalidate>
                <input type="text" name="name" placeholder="Your Name" required>
                <input type="email" name="email" placeholder="Email Address" required>
                <input type="tel" name="phone" placeholder="10-digit Mobile Number" inputmode="numeric" maxlength="10" required>
                <textarea name="message" placeholder="How can we help you?" rows="4" required></textarea>
                <p class="form-validation-message" aria-live="polite"></p>
                <button class="whatsapp-form-submit" type="submit"><i class="fa-brands fa-whatsapp"></i> Send on WhatsApp</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Translate UI created by this shared script and future dynamic widgets too.
    if (savedLanguage !== 'en') translateEntirePage(savedLanguage);
    let translationRefresh;
    const dynamicTranslationObserver = new MutationObserver(() => {
        if (activeLanguage === 'en') return;
        clearTimeout(translationRefresh);
        translationRefresh = setTimeout(() => translateEntirePage(activeLanguage), 0);
    });
    dynamicTranslationObserver.observe(document.body, { childList: true, subtree: true });

    const openModal = () => {
        modal.hidden = false;
        document.body.classList.add('modal-open');
        modal.querySelector('[name="name"]').focus();
    };
    const closeModal = () => {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        floatingActions.querySelector('.floating-whatsapp').focus();
    };
    floatingActions.querySelector('.floating-whatsapp').addEventListener('click', openModal);
    modal.querySelector('.whatsapp-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

    const modalForm = modal.querySelector('#whatsappModalForm');
    const validateModalForm = () => {
        const email = modalForm.elements.email;
        const phone = modalForm.elements.phone;
        const feedback = modalForm.querySelector('.form-validation-message');
        const emailValue = email.value.trim();
        const phoneDigits = phone.value.replace(/\D/g, '');
        email.setCustomValidity(emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) ? 'Please enter a correct email address.' : '');
        phone.setCustomValidity(phone.value.trim() && !/^[6-9]\d{9}$/.test(phoneDigits) ? 'Please enter a correct 10-digit mobile number.' : '');
        feedback.textContent = email.validationMessage || phone.validationMessage;
        return !feedback.textContent;
    };
    modalForm.addEventListener('input', validateModalForm);
    modalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!validateModalForm() || !modalForm.reportValidity()) return;
        const values = new FormData(modalForm);
        const message = [
            'Hello Adrita Bima Kendra, I would like a free consultation.',
            '',
            `Name: ${values.get('name')}`,
            `Email: ${values.get('email')}`,
            `Mobile: ${values.get('phone')}`,
            `Message: ${values.get('message')}`,
        ].join('\n');
        window.open(`https://wa.me/919474862701?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    });

    const revealTargets = document.querySelectorAll(
        'section, .hero, .market-widget, .mover-box, .gallery-item, .service-card, .feature-card, .contact-card'
    );
    const hoverTargets = document.querySelectorAll(
        '.service-card, .feature-card, .mover-box, .gallery-item, .contact-card, .market-widget'
    );

    hoverTargets.forEach((element) => element.classList.add('card-hover'));

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealTargets.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, activeObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            activeObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    revealTargets.forEach((element, index) => {
        element.classList.add('reveal-on-scroll');
        element.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
        observer.observe(element);
    });
});
