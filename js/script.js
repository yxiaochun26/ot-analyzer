document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        serial: document.getElementById('serial-screen'),
        main: document.getElementById('main-screen'),
        loading: document.getElementById('loading-screen'),
        result: document.getElementById('result-screen')
    };

    const serialInput = document.getElementById('serial-input');
    const submitSerialButton = document.getElementById('submit-serial');
    const serialError = document.getElementById('serial-error');

    const submitAnalysisButton = document.getElementById('submit-analysis');
    const backToMainButton = document.getElementById('back-to-main');

    const progressBarInner = document.getElementById('progress-bar-inner');
    const loadingStatus = document.getElementById('loading-status');
    const glitchTextElement = document.getElementById('glitch-text');

    // Game selection and rounds inputs
    const gameSelect = document.getElementById('game');
    const roundsInputGroup = document.getElementById('rounds-input-group');
    const roundsInput1 = document.getElementById('rounds');
    const roundsInputsContainer = document.getElementById('rounds-inputs-container');
    
    // Table inputs
    const tableLabel = document.getElementById('table-label');
    const tableInput = document.getElementById('table');

    // --- Available Icons ---
    // Zeus Icons
    const zeusGameIcons = [
        'atg1788-icon5.png',
        'atg1788-icon8.png',
        'cropped-symbol_01-fa6ccaf3.png',
        'images-removebg-preview1.png', // Renamed file, Special quantity rule for Zeus
        '弓箭.jpg',
        '下載-5-1.png',
        '下載-6-1.png',
        '戰神賽特符號-10-removebg-preview.png',
        '戰神賽特一般符號_綠寶石-removebg-preview.png',
        '戰神賽特一般符號_彎刀-removebg-preview.png'
    ];
    const zeusQuantityRules = {
        'images-removebg-preview1.png': { min: 1, max: 3 } // Updated key
    };

    // Thor Icons (Updated list)
    const thorGameIcons = [
        'images__1_-removebg-preview.png',
        'images__2_-removebg-preview.png',
        'images__3_-removebg-preview.png',
        'images__4_-removebg-preview.png',
        'images__5_-removebg-preview.png',
        'images__6_-removebg-preview.png',
        'images__7_-removebg-preview.png',
        // 'images-removebg-preview.png', // Removed as per request
        'Marquee_freespins_B1.png' // Special quantity rule for Thor
    ];
    const thorQuantityRules = {
        'Marquee_freespins_B1.png': { min: 1, max: 3 }
    };
    
    // 武俠 Icons
    const wuxiaGameIcons = [
        'symbol_04.png',
        'symbol_05.png',
        'symbol_06.png',
        'symbol_07.png',
        'symbol_08.png',
        'symbol_09.png',
        'symbol_10.png',
        'symbol_11.png',
        'symbol_12.png',
        'symbol_14.png' // 特殊數量規則
    ];
    const wuxiaQuantityRules = {
        'symbol_14.png': { min: 1, max: 3 }
    };
    
    // 赤三國 Icons
    const redThreeKingdomsGameIcons = [
        'symbol_151.png', // 特殊數量規則
        'symbol_011.png',
        'symbol_022.png',
        'symbol_033.png',
        'symbol_043.png',
        'symbol_051.png',
        'symbol_061.png',
        'symbol_071.png',
        'symbol_082.png',
        'symbol_091.png'
    ];
    const redThreeKingdomsQuantityRules = {
        'symbol_151.png': { min: 1, max: 3 }
    };

    // Default icons (if no specific game matches)
    const defaultIcon1 = 'atg1788-icon5.png';
    const defaultIcon2 = 'atg1788-icon8.png';

    // --- Helper Functions ---
    // Get random integer within a range (inclusive)
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // --- Function to Update Rounds Inputs Visibility ---
    function updateRoundsInputsVisibility() {
        const selectedGameValue = gameSelect.value; // Get 'Zeus', 'Thor', 'Wukong' etc.

        if (selectedGameValue === 'Thor') {
            roundsInputGroup.style.display = 'none'; // Hide the whole group
        } else {
            // For all other games, show only one input field
            roundsInputGroup.style.display = 'block'; // Show the group
            roundsInput1.style.display = 'block';     // Show the one input
        }
         
        // Clear inputs when hiding
        if (selectedGameValue === 'Thor') {
            roundsInput1.value = '';
        }
         
        // Update table label and placeholder based on game selection
        if (selectedGameValue === 'Thor') {
            tableLabel.innerHTML = '<i class="fas fa-hashtag"></i> 輸入遊戲編碼(請先進遊戲轉一轉看底下的編碼):';
            tableInput.placeholder = '請先進遊戲轉一轉看底下的編碼';
        } else {
            tableLabel.innerHTML = '<i class="fas fa-hashtag"></i> 輸入桌號:';
            tableInput.placeholder = '輸入桌號';
        }
    }

    // --- Screen Navigation ---
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
        // Reset scroll position
        window.scrollTo(0, 0);
    }

    // --- Serial Number Validation (Calls Backend API) ---
    submitSerialButton.addEventListener('click', async () => {
        const serial = serialInput.value.trim().toUpperCase();
        serialError.textContent = '';

        if (!serial) {
            serialError.textContent = '錯誤：序號不能為空！';
            return;
        }

        // 禁用按鈕並顯示提示
        submitSerialButton.disabled = true;
        submitSerialButton.textContent = '驗證中...';

        try {
            // 使用 fetch 呼叫後端 API
            const response = await fetch('/api/validate-serial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ serial: serial })
            });

            // 解析後端回傳的 JSON 結果
            const result = await response.json();

            if (response.ok && result.valid) {
                // 後端驗證成功 (狀態碼 2xx 且 valid 為 true)
                console.log(`序號 ${serial} 驗證通過 (後端)`);
                showScreen('main');
            } else {
                // 後端驗證失敗 (狀態碼不是 2xx 或 valid 為 false)
                console.log(`序號 ${serial} 驗證失敗 (後端)`, result.message);
                // 從後端取得更具體的錯誤訊息
                serialError.textContent = `錯誤：${result.message || '序號無效或錯誤。'}`;
            }

        } catch (error) {
            // 處理網路錯誤或 fetch 本身的錯誤
            console.error('呼叫驗證 API 時出錯:', error);
            serialError.textContent = '錯誤：無法連接驗證伺服器，請稍後再試。';
        } finally {
            // 無論成功或失敗，都重新啟用按鈕並恢復文字
            submitSerialButton.disabled = false;
            submitSerialButton.textContent = '驗證接入';
        }
    });

    // Allow pressing Enter to submit serial
    serialInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            submitSerialButton.click(); // Trigger the button click
        }
    });

    // --- Analysis Process Simulation ---
    submitAnalysisButton.addEventListener('click', () => {
        // 1. Gather form data
        const selectedGameValue = gameSelect.value;
        let roundsValue;
        let roundsRaw = [];

        if (selectedGameValue === 'Thor') {
            roundsValue = 'N/A'; // Not applicable for Thor
        } else {
            // For all other games, just collect the single value
            const r1 = roundsInput1.value.trim();
            roundsRaw = [r1];
            roundsValue = r1 !== '' ? r1 : 'N/A';
        }

        const formData = {
            device: document.getElementById('device').value,
            platform: document.getElementById('platform').selectedOptions[0].text,
            amount: document.getElementById('amount').value,
            game: document.getElementById('game').selectedOptions[0].text, // Game Text for display
            gameValue: selectedGameValue, // Game Value for logic
            rounds: roundsValue, // Formatted string for display
            table: document.getElementById('table').value,
        };

        // Basic validation
        let isValid = true;
        let missingFields = [];
        if (!formData.amount) missingFields.push("金額");
        if (!formData.table) missingFields.push("桌號");

        // Only validate rounds if the input group is visible
        if (roundsInputGroup.style.display !== 'none') {
            if (selectedGameValue !== 'Thor' && roundsRaw[0] === '') {
                missingFields.push("未開轉數");
            }
        }

        if (missingFields.length > 0) {
             alert(`請填寫以下欄位： ${missingFields.join(', ')}！`);
             isValid = false;
        }

        if (!isValid) return;

        console.log("開始分析，表單資料:", formData);

        // 2. Show loading screen and start simulation
        showScreen('loading');
        simulateLoading(formData);
    });

    // --- Loading Simulation ---
    function simulateLoading(formData) {
        let progress = 0;
        let statusMessage = "初始化分析引擎...";
        let glitchInterval;
        let progressInterval;

        progressBarInner.style.width = '0%';
        loadingStatus.textContent = statusMessage;
        glitchTextElement.textContent = generateGlitchText(10); // Initial glitch

        // Start glitch effect
        glitchInterval = setInterval(() => {
            glitchTextElement.textContent = generateGlitchText(10);
        }, 100); // Update glitch text rapidly

        // Simulate progress steps
        progressInterval = setInterval(() => {
            progress += Math.random() * 10 + 5; // Random progress increment
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                clearInterval(glitchInterval); // Stop glitching
                glitchTextElement.textContent = "分析完成。生成報告..."; // Final glitch message
                loadingStatus.textContent = "分析完成！";
                 // Short delay before showing results
                setTimeout(() => showResultScreen(formData), 1000);
            } else {
                 updateLoadingStatus(progress);
            }
             progressBarInner.style.width = `${progress}%`;
        }, 400); // Update progress every 400ms
    }

    function updateLoadingStatus(progress) {
         if (progress < 20) statusMessage = "連接安全伺服器...";
         else if (progress < 40) statusMessage = "注入分析腳本...";
         else if (progress < 60) statusMessage = "掃描數據節點...";
         else if (progress < 80) statusMessage = "交叉驗證模式...";
         else if (progress < 95) statusMessage = "編譯結果...";
         else statusMessage = "最後處理...";
         loadingStatus.textContent = statusMessage;
    }


    const glitchChars = "!@#$%^&*()_+=-`~[]\\{}|;':\",./<>?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    function generateGlitchText(lines) {
        let text = "";
        for (let i = 0; i < lines; i++) {
            let line = "";
            const lineLength = Math.floor(Math.random() * 50) + 20; // Random line length
            for (let j = 0; j < lineLength; j++) {
                line += glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
            }
            text += line + "\n";
        }
        return text;
    }

    // --- Show Result Screen ---
    function showResultScreen(formData) {
        document.getElementById('result-device').textContent = formData.device;
        document.getElementById('result-platform').textContent = formData.platform;
        document.getElementById('result-amount').textContent = formData.amount ? parseInt(formData.amount).toLocaleString() : 'N/A';
        document.getElementById('result-game').textContent = formData.game;
        
        // 設定桌號/遊戲編碼顯示
        const resultTableElement = document.getElementById('result-table');
        const tableItem = resultTableElement.closest('.result-item');
        
        if (formData.gameValue === 'Thor') {
            // 安全地更新標籤文字 - 不依賴於 nextSibling
            tableItem.innerHTML = '<i class="fas fa-hashtag"></i> 遊戲編碼: <span id="result-table">' + (formData.table || 'N/A') + '</span>';
        } else {
            // 安全地更新標籤文字 - 不依賴於 nextSibling
            tableItem.innerHTML = '<i class="fas fa-hashtag"></i> 設定桌號: <span id="result-table">' + (formData.table || 'N/A') + '</span>';
        }
        
        // 可能的結果訊息列表
        const resultMessages = [
            "很抱歉... 此房計算不出參考值建議換房",
            "此房不適合參考訊號購買, 平轉即可",
            "資料讀取失敗... 請在重試",
            "平轉(紅球100倍未消), 可購買",
            "平轉遇(綠球2顆未消),可購買",
            "平轉遇(綠球3顆未消),可購買",
            "平轉(紅球100倍未消), 過兩轉後可購買",
            "平轉(紅球100倍未消), 過四轉後可購買",
            "平轉(紅球100倍未消), 過九轉後可購買",
            "平轉(紅球100倍未消), 過十九轉後可購買",
            "平轉遇(藍球1顆未消),可購買",
            "此房高機率獲取JP,建議自動轉盯盤",
            "階梯式打法,10塊(25轉)20塊(25轉),方可固定金額平轉",
            "系統計算人數超載  請更換遊戲嘗試....",
            "此房建議短打 上限99轉內即可換房"
        ];

        // 當選擇孫行者或武俠時需要過濾的訊息
        const filteredMessages = [
            "平轉(紅球100倍未消), 可購買",
            "平轉遇(綠球2顆未消),可購買",
            "平轉遇(綠球3顆未消),可購買",
            "平轉(紅球100倍未消), 過兩轉後可購買",
            "平轉(紅球100倍未消), 過四轉後可購買",
            "平轉(紅球100倍未消), 過九轉後可購買",
            "平轉(紅球100倍未消), 過十九轉後可購買",
            "平轉遇(藍球1顆未消),可購買"
        ];

        // 故障訊息列表（會導致失敗顯示）
        const failureMessages = [
            "很抱歉... 此房計算不出參考值建議換房",
            "系統計算人數超載  請更換遊戲嘗試....",
            "資料讀取失敗... 請在重試"
        ];

        // 首先找到相關元素
        const dataRangeElement = document.getElementById('result-data-range');
        const dataRangeParent = dataRangeElement.parentElement;
        const disableRotationItem = document.querySelector('.result-item:has(.success)');
        
        // 決定顯示爆分率還是訊息
        if (Math.random() < 0.2) {
            // 顯示爆分率 (70-97%)
            const explosionRate = getRandomInt(70, 97);
            dataRangeParent.innerHTML = '<i class="fas fa-database"></i> 爆分率: <span id="result-data-range" class="highlight">' + `${explosionRate}%` + '</span>';
        } else {
            // 根據遊戲類型選擇適合的訊息列表
            let availableMessages = [...resultMessages];
            
            // 如果是孫行者或武俠遊戲，過濾掉特定的訊息
            if (formData.gameValue === 'Wuxia' || formData.gameValue === 'Wukong') {
                availableMessages = availableMessages.filter(msg => !filteredMessages.includes(msg));
            }
            
            // 顯示隨機訊息，但保留"爆分率:"標籤
            const randomMessageIndex = Math.floor(Math.random() * availableMessages.length);
            const selectedMessage = availableMessages[randomMessageIndex];
            
            // 保留"爆分率:"標籤，只替換值的部分
            dataRangeParent.innerHTML = '<i class="fas fa-database"></i> 爆分率: <span id="result-data-range" class="highlight">' + selectedMessage + '</span>';
            
            // 判斷是否為失敗訊息
            const isFailureMessage = failureMessages.includes(selectedMessage);
            
            // 修改解除空轉的顯示
            if (isFailureMessage) {
                disableRotationItem.innerHTML = '<i class="fas fa-check-circle"></i> 解除空轉: <span class="failure" style="color: red;">失敗</span>';
                
                // 當出現故障訊息時，隱藏購買建議圖標區域
                const purchaseIconsSection = document.querySelector('.purchase-section');
                if (purchaseIconsSection) {
                    purchaseIconsSection.style.display = 'none';
                }
            } else {
                disableRotationItem.innerHTML = '<i class="fas fa-check-circle"></i> 解除空轉: <span class="success">完成</span>';
                
                // 確保購買建議圖標區域顯示（可能在之前被隱藏）
                const purchaseIconsSection = document.querySelector('.purchase-section');
                if (purchaseIconsSection) {
                    purchaseIconsSection.style.display = 'block';
                }
            }
        }
        
        // Display rounds based on collected data
        const resultRoundsElement = document.getElementById('result-rounds');
        const roundsItemGroup = resultRoundsElement.closest('.result-item');

        if (formData.gameValue === 'Thor') {
            roundsItemGroup.style.display = 'none';
        } else {
            roundsItemGroup.style.display = 'block';
            resultRoundsElement.textContent = formData.rounds;
        }

        // --- Unique Icon Logic --- 
        const purchaseIcon1Div = document.getElementById('purchase-icon-1');
        const purchaseIcon2Div = document.getElementById('purchase-icon-2');
        const purchaseIcon3Div = document.getElementById('purchase-icon-3');
        const iconElements = [
            { div: purchaseIcon1Div, img: document.getElementById('result-icon1-img'), count: document.getElementById('result-icon1-count') },
            { div: purchaseIcon2Div, img: document.getElementById('result-icon2-img'), count: document.getElementById('result-icon2-count') },
            { div: purchaseIcon3Div, img: document.getElementById('result-icon3-img'), count: document.getElementById('result-icon3-count') }
        ];

        // Reset visibility for all icon slots
        iconElements.forEach(el => el.div.style.display = 'none');

        let iconsToDisplay = 0;
        let sourceIconList = [];
        let specificQuantityRules = {};
        let defaultMinQuantity = 3;
        let defaultMaxQuantity = 7;
        let showThirdIcon = false;

        if (formData.gameValue === 'Zeus') {
            iconsToDisplay = 3;
            sourceIconList = zeusGameIcons;
            specificQuantityRules = zeusQuantityRules;
            defaultMinQuantity = 3;
            defaultMaxQuantity = 7;
            showThirdIcon = true;
        } else if (formData.gameValue === 'Thor') {
            iconsToDisplay = 3;
            sourceIconList = thorGameIcons;
            specificQuantityRules = thorQuantityRules;
            defaultMinQuantity = 3;
            defaultMaxQuantity = 7;
            showThirdIcon = true;
        } else if (formData.gameValue === 'Wuxia') {
            iconsToDisplay = 3;
            sourceIconList = wuxiaGameIcons;
            specificQuantityRules = wuxiaQuantityRules;
            defaultMinQuantity = 3;
            defaultMaxQuantity = 7;
            showThirdIcon = true;
        } else if (formData.gameValue === 'RedThreeKingdoms') {
            iconsToDisplay = 3;
            sourceIconList = redThreeKingdomsGameIcons;
            specificQuantityRules = redThreeKingdomsQuantityRules;
            defaultMinQuantity = 3;
            defaultMaxQuantity = 7;
            showThirdIcon = true;
        } else {
            // Default / Other Games: Show 2 default icons
            iconsToDisplay = 2;
            iconElements[0].div.style.display = 'inline-block';
            iconElements[0].img.src = `img/${defaultIcon1}`;
            iconElements[0].img.alt = 'Default Icon 1';
            iconElements[0].count.textContent = getRandomInt(1, 5);

            iconElements[1].div.style.display = 'inline-block';
            iconElements[1].img.src = `img/${defaultIcon2}`;
            iconElements[1].img.alt = 'Default Icon 2';
            iconElements[1].count.textContent = getRandomInt(3, 8);
        }

        // Select Unique Icons for Zeus/Thor
        if ((formData.gameValue === 'Zeus' || formData.gameValue === 'Thor' || formData.gameValue === 'Wuxia' || formData.gameValue === 'RedThreeKingdoms') && sourceIconList.length > 0) {
            const selectedUniqueIcons = [];
            const listCopy = [...sourceIconList]; // Work on a copy

            if (listCopy.length < iconsToDisplay) {
                console.warn(`Warning: Not enough unique icons (${listCopy.length}) available for ${formData.game}. Displaying duplicates.`);
                // Fallback: just select randomly with potential duplicates
                for (let i = 0; i < iconsToDisplay; i++) {
                    const randomIndex = Math.floor(Math.random() * sourceIconList.length); // Select from original list
                    selectedUniqueIcons.push(sourceIconList[randomIndex]);
                 }
            } else {
                // Select unique icons
                for (let i = 0; i < iconsToDisplay; i++) {
                    if (listCopy.length === 0) break; // Should not happen if length check passed, but safe guard
                    const randomIndex = Math.floor(Math.random() * listCopy.length);
                    const chosenIcon = listCopy.splice(randomIndex, 1)[0]; // Pick and remove
                    selectedUniqueIcons.push(chosenIcon);
                }
            }

            // Assign unique icons and quantities
            for (let i = 0; i < selectedUniqueIcons.length; i++) {
                 if (i >= iconElements.length) break; // Safety check

                const iconData = iconElements[i];
                const filename = selectedUniqueIcons[i];

                iconData.div.style.display = 'inline-block'; // Make the slot visible
                iconData.img.src = `img/${filename}`;
                iconData.img.alt = filename.split('.')[0].replace(/[-_]/g, ' ');

                let quantity;
                if (specificQuantityRules[filename]) {
                    const rule = specificQuantityRules[filename];
                    quantity = getRandomInt(rule.min, rule.max);
                } else {
                    quantity = getRandomInt(defaultMinQuantity, defaultMaxQuantity);
                }
                iconData.count.textContent = quantity;
            }
        }

        showScreen('result');
    }

     // --- Back to Main Screen ---
     backToMainButton.addEventListener('click', () => {
        showScreen('main');
         // Optionally reset the form fields
         document.getElementById('amount').value = '';
         document.getElementById('rounds').value = '';
         document.getElementById('table').value = '';
     });

    // --- Event Listener for Game Selection (needs to be after function definition) ---
    gameSelect.addEventListener('change', updateRoundsInputsVisibility);

    // --- Initial Setup ---
    updateRoundsInputsVisibility(); // Call on load to set initial state
    showScreen('serial'); // Show the serial screen first
}); 