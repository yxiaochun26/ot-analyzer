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

    // 孫行者 Icons
    const wukongGameIcons = [
        '10.png',
        '11.png',
        '12.png',
        '13.png',
        '14.png', // 特殊數量規則 1-2
        '15.png', // 特殊數量規則 1-3
        '16.png',
        '17.png',
        '18.png'
    ];
    const wukongQuantityRules = {
        '14.png': { min: 1, max: 2 },
        '15.png': { min: 1, max: 3 }
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

    // --- Function to Update Inputs Visibility Based on Game Selection ---
    function updateRoundsInputsVisibility() {
        const selectedGameValue = gameSelect.value; // Get 'Zeus', 'Thor', 'Wukong' etc.
        
        // 取得得分率輸入區域
        const scoreRateGroup = document.querySelector('.input-group:has([id^="score-"])');
        
        // 更新轉數輸入區域顯示
        if (selectedGameValue === 'Thor' || selectedGameValue === 'Thor2') {
            roundsInputGroup.style.display = 'none'; // 隱藏轉數組
            // 同時隱藏得分率輸入框
            if (scoreRateGroup) {
                scoreRateGroup.style.display = 'none';
            }
        } else {
            // 非雷神之槌時，顯示轉數輸入框和得分率
            roundsInputGroup.style.display = 'block'; // 顯示轉數組
            roundsInput1.style.display = 'block';     // 顯示單一輸入框
            
            // 同時顯示得分率輸入框
            if (scoreRateGroup) {
                scoreRateGroup.style.display = 'block';
            }
        }
         
        // 隱藏時清空輸入內容
        if (selectedGameValue === 'Thor') {
            roundsInput1.value = '';
            
            // 清空得分率輸入
            const todayScoreInput = document.getElementById('score-today');
            const monthScoreInput = document.getElementById('score-month');
            if (todayScoreInput) todayScoreInput.value = '';
            if (monthScoreInput) monthScoreInput.value = '';
        }
         
        // 更新桌號標籤和提示文字
        if (selectedGameValue === 'Thor' || selectedGameValue === 'Thor2') {
            if (selectedGameValue === 'Thor2') {
                tableLabel.innerHTML = '<i class="fas fa-hashtag"></i> 輸入遊戲編碼末5碼(請先一轉後查看左下編碼):';
                tableInput.placeholder = '請先一轉後查看左下編碼';
            } else {
                tableLabel.innerHTML = '<i class="fas fa-hashtag"></i> 輸入遊戲編碼末5碼(請先至雷神一轉後查看底下編碼):';
                tableInput.placeholder = '請先至雷神一轉後查看底下編碼';
            }
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

        // 獲取所有表單數據
        const formData = {
            device: document.getElementById('device').value,
            platform: document.getElementById('platform').selectedOptions[0].text,
            scoreTodayValue: document.getElementById('score-today').value,
            scoreMonthValue: document.getElementById('score-month').value,
            game: document.getElementById('game').selectedOptions[0].text, // 遊戲名稱文本
            gameValue: selectedGameValue, // 遊戲值用於邏輯判斷
            rounds: roundsValue, // 已經處理好的轉數值
            table: document.getElementById('table').value
        };

        // Basic validation
        let isValid = true;
        let missingFields = [];
        
        // 只有非雷神之槌和RK電子雷神II遊戲才檢查得分率
        if (selectedGameValue !== 'Thor' && selectedGameValue !== 'Thor2') {
            if (!formData.scoreTodayValue) missingFields.push("今日得分率");
            if (!formData.scoreMonthValue) missingFields.push("30日得分率");
        }
        
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
        try {
            // 安全獲取元素，並處理可能的null值
            const deviceElement = document.getElementById('result-device');
            if (deviceElement) deviceElement.textContent = formData.device || 'N/A';
            
            const platformElement = document.getElementById('result-platform');
            if (platformElement) platformElement.textContent = formData.platform || 'N/A';

            // 更新金額顯示為得分率
            const amountElement = document.getElementById('result-amount');
            if (amountElement) {
                const amountItem = amountElement.closest('.result-item');
                
                if (amountItem) {
                    // 如果是雷神之槌，隱藏得分率項目
                    if (formData.gameValue === 'Thor') {
                        amountItem.style.display = 'none';
                    } else {
                        // 顯示得分率項目
                        amountItem.style.display = 'block';
                        amountItem.innerHTML = '<i class="fas fa-chart-bar"></i> 得分率: <span id="result-amount">今日 ' + 
                            (formData.scoreTodayValue || 'N/A') + ' / 30日 ' + (formData.scoreMonthValue || 'N/A') + '</span>';
                    }
                }
            }
            
            const gameElement = document.getElementById('result-game');
            if (gameElement) gameElement.textContent = formData.game || 'N/A';
        } catch (error) {
            console.error('在設置得分率信息時出錯:', error);
        }
        
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
        
        // 需要隱藏圖標的訊息列表（包括故障訊息和其他特定訊息）
        const hideIconsMessages = [
            ...failureMessages,
            "此房不適合參考訊號購買, 平轉即可",
            "平轉(紅球100倍未消), 可購買",
            "平轉遇(綠球2顆未消),可購買",
            "平轉遇(綠球3顆未消),可購買",
            "平轉(紅球100倍未消), 過兩轉後可購買",
            "平轉(紅球100倍未消), 過四轉後可購買",
            "平轉(紅球100倍未消), 過九轉後可購買",
            "平轉(紅球100倍未消), 過十九轉後可購買",
            "平轉遇(藍球1顆未消),可購買"
        ];

        // 首先找到相關元素
        const dataRangeElement = document.getElementById('result-data-range');
        if (!dataRangeElement) {
            console.error('找不到 result-data-range 元素');
            showScreen('result'); // 嘗試顯示結果頁面，即使有錯誤
            return; // 提前返回，避免後續錯誤
        }
        
        const dataRangeParent = dataRangeElement.parentElement;
        
        // 直接通過索引找到解除空轉元素（假設它是第8個result-item）
        // 這比使用:has選擇器更可靠
        const resultItems = document.querySelectorAll('.result-item');
        let disableRotationItem = null;
        
        // 遍歷所有result-item元素，尋找包含"解除空轉"文本的元素
        for (let i = 0; i < resultItems.length; i++) {
            if (resultItems[i].textContent.includes('解除空轉')) {
                disableRotationItem = resultItems[i];
                console.log('找到解除空轉元素:', disableRotationItem);
                break;
            }
        }
        
        // 如果還是找不到，使用一個保守的備用方法
        if (!disableRotationItem) {
            console.warn('無法找到解除空轉元素，嘗試使用其他方法');
            // 嘗試獲取第8個元素（假設解除空轉通常是第8個result-item）
            if (resultItems.length >= 8) {
                disableRotationItem = resultItems[7]; // 索引從0開始，所以第8個是索引7
            } else if (resultItems.length > 0) {
                // 如果連8個元素都沒有，使用最後一個元素
                disableRotationItem = resultItems[resultItems.length - 1];
            }
        }
        
        // 決定顯示爆分率還是訊息
        if (Math.random() < 0.3) {
            // 顯示爆分率 (70-97%)
            const explosionRate = getRandomInt(70, 97);
            dataRangeParent.innerHTML = '<i class="fas fa-database"></i> 爆分率: <span id="result-data-range" class="highlight">' + `${explosionRate}%` + '</span>';
            
            // 確保在顯示百分比時也處理圖標顯示
            // 對於百分比顯示，我們總是顯示圖標，除非是特定遊戲有特殊處理
            const purchaseIconsSection = document.querySelector('.purchase-section');
            if (purchaseIconsSection) {
                // 即使是雷神之槌，在顯示百分比時也顯示免游訊號圖標
                purchaseIconsSection.style.display = 'block';
                console.log('顯示百分比時設置圖標可見 (遊戲類型:', formData.gameValue, ')');
            }
            
            // 確保解除空轉顯示為"完成"
            try {
                if (disableRotationItem) {
                    disableRotationItem.innerHTML = '<i class="fas fa-check-circle"></i> 解除空轉: <span class="success">完成</span>';
                    console.log('百分比顯示時設置解除空轉為完成');
                }
            } catch (error) {
                console.error('在設置解除空轉信息時出錯:', error);
            }
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
            
            // 判斷是否為失敗訊息和是否需要隱藏圖標
            console.log('選中的訊息:', selectedMessage);
            console.log('故障訊息列表:', failureMessages);
            console.log('該訊息是否為故障訊息:', failureMessages.includes(selectedMessage));
            
            const isFailureMessage = failureMessages.includes(selectedMessage);
            const shouldHideIcons = hideIconsMessages.includes(selectedMessage);
            
            // 修改解除空轉的顯示
            try {
                if (disableRotationItem) {
                    // 記錄更新前的狀態，便於調試
                    console.log('更新前的解除空轉元素內容:', disableRotationItem.innerHTML);
                    console.log('訊息是否為故障訊息:', isFailureMessage, '選中的訊息:', selectedMessage);
                    
                    // 創建新的HTML內容而不是直接修改innerHTML，確保一致性
                    let newRotationHTML = '';
                    if (isFailureMessage) {
                        newRotationHTML = '<i class="fas fa-check-circle"></i> 解除空轉: <span class="failure" style="color: red;">失敗</span>';
                    } else {
                        newRotationHTML = '<i class="fas fa-check-circle"></i> 解除空轉: <span class="success">完成</span>';
                    }
                    
                    // 更新元素內容
                    disableRotationItem.innerHTML = newRotationHTML;
                    console.log('更新後的解除空轉元素內容:', disableRotationItem.innerHTML);
                    
                    // 再次確認狀態是否如預期
                    const statusElement = disableRotationItem.querySelector('.failure, .success');
                    if (statusElement) {
                        console.log('解除空轉最終狀態:', statusElement.textContent, 
                            '類別:', statusElement.className, 
                            '與預期一致:', (isFailureMessage ? statusElement.classList.contains('failure') : statusElement.classList.contains('success')));
                    }
                }
            } catch (error) {
                console.error('在設置解除空轉信息時出錯:', error);
            }
            
            // 根據訊息控制購買建議圖標區域的顯示/隱藏
            const purchaseIconsSection = document.querySelector('.purchase-section');
            if (purchaseIconsSection) {
                if (shouldHideIcons) {
                    // 當出現任何需要隱藏圖標的訊息時，隱藏購買建議圖標區域
                    purchaseIconsSection.style.display = 'none';
                } else {
                    // 其他情況下顯示購買建議圖標區域
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
        } else if (formData.gameValue === 'Wukong') {
            iconsToDisplay = 2; // 孫行者只顯示2個圖標
            sourceIconList = wukongGameIcons;
            specificQuantityRules = wukongQuantityRules;
            defaultMinQuantity = 2; // 一般圖標數量最小值為2
            defaultMaxQuantity = 5; // 一般圖標數量最大值為5
            showThirdIcon = false; // 不顯示第三個圖標
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
            try {
                iconsToDisplay = 2;
                // 檢查圖片是否存在
                iconElements[0].div.style.display = 'inline-block';
                iconElements[0].img.src = `img/${defaultIcon1}`;
                iconElements[0].img.alt = 'Default Icon 1';
                iconElements[0].count.textContent = getRandomInt(1, 5);
                
                // 添加錯誤處理
                iconElements[0].img.onerror = function() {
                    console.warn(`圖片不存在: img/${defaultIcon1}`);
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+圖片缺失</dGV4dD48L3N2Zz4=';
                };

                iconElements[1].div.style.display = 'inline-block';
                iconElements[1].img.src = `img/${defaultIcon2}`;
                iconElements[1].img.alt = 'Default Icon 2';
                iconElements[1].count.textContent = getRandomInt(3, 8);
                
                // 添加錯誤處理
                iconElements[1].img.onerror = function() {
                    console.warn(`圖片不存在: img/${defaultIcon2}`);
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+圖片缺失</dGV4dD48L3N2Zz4=';
                };
            } catch (error) {
                console.error('顯示默認圖標時出錯:', error);
            }
        }

        // Select Unique Icons for Zeus/Thor/Wukong/Wuxia/RedThreeKingdoms
        if ((formData.gameValue === 'Zeus' || formData.gameValue === 'Thor' || formData.gameValue === 'Wukong' || formData.gameValue === 'Wuxia' || formData.gameValue === 'RedThreeKingdoms') && sourceIconList.length > 0) {
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

                // 添加圖片錯誤處理
                iconData.img.onerror = function() {
                    console.warn(`圖片載入失敗: img/${filename}`);
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+圖片缺失</dGV4dD48L3N2Zz4=';
                };

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

        // 在爆分率區塊下方新增提示語
        let tipElement = document.getElementById('result-save-tip');
        if (!tipElement) {
            tipElement = document.createElement('div');
            tipElement.id = 'result-save-tip';
            tipElement.style.color = '#ff69b4';
            tipElement.style.textAlign = 'center';
            tipElement.style.marginTop = '16px';
            tipElement.style.fontWeight = 'bold';
            tipElement.textContent = '請截圖此畫面保存避免權益損失';
            dataRangeParent.parentElement.appendChild(tipElement);
        }
    }

    // --- Back to Main Screen ---
    backToMainButton.addEventListener('click', () => {
        showScreen('serial'); // 直接回到序號輸入首頁
        // 重置表單字段
        document.getElementById('score-today').value = '';
        document.getElementById('score-month').value = '';
        document.getElementById('rounds').value = '';
        document.getElementById('table').value = '';
    });

    // --- Event Listener for Game Selection (needs to be after function definition) ---
    gameSelect.addEventListener('change', updateRoundsInputsVisibility);

    // --- Initial Setup ---
    updateRoundsInputsVisibility(); // Call on load to set initial state
    showScreen('serial'); // Show the serial screen first

    // 強制移除不該顯示的選項（如 RK電子雷神II）
    const thor2Option = gameSelect.querySelector('option[value="Thor2"]');
    if (thor2Option) {
        gameSelect.removeChild(thor2Option);
    }
});