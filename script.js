let currentQuestionIndex = 0;
let selectedAnswers = [];
let questions = [];
let options = [];

let optionsMale = [];
let optionsFem = [];

let tooltips = [];
let income_selectedIndex;

//全csvファイルの読み込み用配列
const screenCsvFiles = [
    //画面表示用csv
    //  質問文、選択肢、ツールチップ
    { name: 'Qst_list.csv', processFunc: text => text.trim().split('\n').map(line => line.split(',')), data: null },
    { name: 'optionsMale.csv', processFunc: text => parseCSV(text), data: null },
    { name: 'optionsFem.csv', processFunc: text => parseCSV(text), data: null },
    { name: 'tooltip.csv', processFunc: text => text.trim().split('\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },//csv内の空のセルを排除
];

//選択結果表示
function showResults() {
    const resultsContainer = document.getElementById('results');
    const question = document.getElementById('question');

    // ボタンを押した時点でresult.jsの計算処理を実行し、結果を取得する
    performCalculation(function (population, sum_age_area_population, population_Rate) {

        question.innerHTML = `
            あなたの条件に合う人は <b>${population}</b> 人いることがわかったわよ。<br>
            あなたの「年齢・地域」の条件に合う人は、<br>
            <b>${sum_age_area_population}</b>人もいるけど、<br>
            あなたの理想に合う人はそのうち<b>${population_Rate}</b>％のようね。<br>
        `;

        document.getElementById('resultsContainer').style.display = 'block';
        document.getElementById('resultButton').style.display = 'none';
        document.getElementById('questionContainer').style.display = 'none';


        //「結果を確認」ボタン押下後にボタンを削除
        const resultButton = document.getElementById('resultButton');
        if (resultButton) {
            resultButton.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const incomeSlider = document.getElementById('income-slider');
    const incomeValue = document.getElementById('income-value');
    const sliderContainer = document.getElementById('slider-container'); // スライダーコンテナ

    //質問および選択肢の画面表示
    function showQuestion() {
        const nextButton = document.getElementById('nextButton');

        // nextButtonがホバー状態なら、通常状態にリセットする
        nextButton.style.backgroundColor = ''; // 背景色をリセット（CSSで定義された状態に戻る）
        // マウスがボタン上にいる場合、hover状態を強制的に解除
        nextButton.dispatchEvent(new Event('mouseleave'));

        showQuestionList();

        if (currentQuestionIndex < questions.length) {
            // 質問4：収入の場合のみスライダーを表示
            if (currentQuestionIndex === 3) { // 質問4はインデックス3


                // スライダーの値が変更されたときの処理
                incomeSlider.addEventListener('input', function () {
                    const value = incomeSlider.value;

                    if (value === '0') {
                        incomeValue.textContent = "収入無しでもOK";
                    } else {
                        incomeValue.textContent = value + '万円以上';
                    }
                    selectedAnswers[currentQuestionIndex] = [value];
                });

                sliderContainer.style.display = 'flex';
                const optionButtons = document.querySelectorAll('#options button');
                optionButtons.forEach(btn => btn.style.display = 'none'); // 選択肢ボタンを非表示にする
                selectedAnswers[currentQuestionIndex] = incomeSlider.value;

            } else {
                sliderContainer.style.display = 'none';
                const optionButtons = document.querySelectorAll('#options button');
                optionButtons.forEach(btn => btn.style.display = 'block'); // 選択肢ボタンを表示する

                const question = questions[currentQuestionIndex];
                if (question[1] === 'multiple') {
                    document.getElementById('question').innerText = question[3] + '\n(複数選択可)';
                } else {
                    document.getElementById('question').innerText = question[3];
                }
                const optionsContainer = document.getElementById('options');
                optionsContainer.innerHTML = '';

                setOptionsByGender(); // 性別に基づいて選択肢を設定

                const optionsToDisplay = options[currentQuestionIndex];
                const isMultipleChoice = optionsToDisplay[1] === '〇';

                for (let i = 2; i < optionsToDisplay.length; i++) {
                    const option = optionsToDisplay[i];
                    const button = document.createElement('button');

                    // 質問10：性格の場合のみツールチップを追加
                    if (currentQuestionIndex === 9 && i !== 2) { // 質問10はインデックス9
                        const tooltipSpan = document.createElement('span');
                        tooltipSpan.classList.add('tooltiptext');
                        tooltipSpan.innerText = tooltips[currentQuestionIndex][i - 1];
                        const tooltipDiv = document.createElement('div');
                        tooltipDiv.classList.add('tooltip');
                        tooltipDiv.appendChild(button);
                        tooltipDiv.appendChild(tooltipSpan);
                        optionsContainer.appendChild(tooltipDiv);
                    } else {
                        optionsContainer.appendChild(button);
                    }

                    // 質問4以外の場合
                    if (currentQuestionIndex !== 3) { // 質問4はインデックス3
                        button.innerText = option;
                        button.classList.add('option-button');

                        // クリックイベントを設定
                        button.onclick = () => {
                            toggleOption(button, option, isMultipleChoice);

                            // 選択状態を反映
                            if (selectedAnswers[currentQuestionIndex] && selectedAnswers[currentQuestionIndex].includes(option)) {
                                button.classList.add('selected');
                            } else {
                                button.classList.remove('selected');
                            }
                            allSelectedButton(button, option);
                        };
                    }
                }
            }
        } else {
            document.getElementById('question').innerText = 'よ～くわかったわ。';
            document.getElementById('options').innerHTML = '';
            document.getElementById('nextButton').style.display = 'none';

            // 「結果を確認」ボタンを追加
            const resultButton = document.createElement('button');
            resultButton.innerText = '結果を確認';
            resultButton.id = 'resultButton';  // IDを追加
            resultButton.style.display = 'block';
            resultButton.onclick = showResults;
            document.getElementById('options').appendChild(resultButton);
        }
    }

    function allSelectedButton(button, option) {
        // 質問4～11の場合の特定処理
        if (currentQuestionIndex >= 3 && currentQuestionIndex <= 9) {
            const optionButtons = document.querySelectorAll('#options button');
            const isFirstOptionSelected = optionButtons[0].classList.contains('selected');

            if (option === options[currentQuestionIndex][2]) {//"気にしない"のボタンが押下された時の処理
                if (isFirstOptionSelected) {
                    optionButtons.forEach(button => button.classList.add('selected'));// 選択状態にする
                    // 現在の質問に対するユーザーの選択を記録
                    selectedAnswers[currentQuestionIndex] = options[currentQuestionIndex].slice(2);

                } else {
                    optionButtons.forEach(button => button.classList.remove('selected'));// 選択状態にする

                    // 現在の質問に対するユーザーの選択をリセット
                    selectedAnswers[currentQuestionIndex] = [];
                }
            } else {　//"気にしない"以外のボタンが押下された時の処理

                optionButtons.forEach((btn, index) => {
                    if (!btn.classList.contains('selected')) {// 解除状態のボタンがあるなら
                        optionButtons[0].classList.remove('selected'); // 最初の選択肢も解除
                        selectedAnswers[currentQuestionIndex] = selectedAnswers[currentQuestionIndex].filter(item => item !== optionButtons[0].textContent);
                    }
                });
                // 他のすべての選択肢が選択されている場合、最初の選択肢も選択状態にする
                if (Array.from(optionButtons).slice(1).every(btn => btn.classList.contains('selected'))) {
                    optionButtons[0].classList.add('selected');
                    // 現在の質問に対するユーザーの選択を記録
                    selectedAnswers[currentQuestionIndex] = options[currentQuestionIndex].slice(2);
                }
            }
        }
    }

    // ボタンの選択状態を切り替える関数
    function toggleOption(button, option, isMultipleChoice) {

        if (isMultipleChoice) {
            button.classList.toggle('selected');
            if (!selectedAnswers[currentQuestionIndex]) {
                selectedAnswers[currentQuestionIndex] = [];
            }
            const buttonNum = selectedAnswers[currentQuestionIndex].indexOf(option);
            const buttonStatus = button.classList.contains('selected');

            if (buttonStatus === true) {
                selectedAnswers[currentQuestionIndex].push(option);
            } else {
                //選択状態を解除したときの処理
                selectedAnswers[currentQuestionIndex].splice(buttonNum, 1);
            }
        } else {
            const optionButtons = document.querySelectorAll('#options button');
            optionButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedAnswers[currentQuestionIndex] = [option];

        }

        // 選択状態の選択肢を選択肢の順番に並び替える処理を追加
        if (selectedAnswers[currentQuestionIndex]) {
            selectedAnswers[currentQuestionIndex].sort((a, b) => {
                return options[currentQuestionIndex].indexOf(a) - options[currentQuestionIndex].indexOf(b);
            });
        }
    }
    // showQuestion関数をグローバルにアクセスできるようにする
    window.showQuestion = showQuestion;

});

//質問項目の表示処理
function showQuestionList() {
    const Qst_listContainer = document.getElementById('question_list')
    Qst_listContainer.innerHTML = '';
    questions.forEach((question, index) => {
        const div = document.createElement('div');
        div.innerText = `${index + 1}.${question[2]}：`;
        Qst_listContainer.appendChild(div);
    });
}

//選択した回答を画面表示させる
function showSelections() {
    const selectionsContainer = document.getElementById('selections');
    selectionsContainer.innerHTML = '';
    selectedAnswers.forEach((answer, index) => {
        const div = document.createElement('div');
        if (answer[0] === '気にしない') {
            div.innerText = `気にしない`;
        } else {
            if (index === 3) {
                div.innerText = `${answer}` + '万円以上';
            } else {
                div.innerText = `${answer}`;
            }
        }
        selectionsContainer.appendChild(div);
    });
}

//次へボタンを押したときの処理（次の質問および選択肢を表示させる）
function showNextQuestion() {
    if (!selectedAnswers[currentQuestionIndex] || selectedAnswers[currentQuestionIndex].length === 0) {
        alert('選択肢を選んでちょうだい');
        return;
    }
    currentQuestionIndex++;
    showSelections();
    showQuestion();
}

//性別ごとに選択肢を変える処理
function setOptionsByGender() {
    if (selectedAnswers[0] && selectedAnswers[0][0] === '男性') {
        options[currentQuestionIndex] = optionsMale[currentQuestionIndex];
    } else {
        options[currentQuestionIndex] = optionsFem[currentQuestionIndex];
    }
}
