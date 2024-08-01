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
    // performCalculation(function (population, sum_age_area_population, population_Rate) {
    performCalculation(function (population, sum_age_area_population, population_Rate) {

        question.innerHTML = `
            あなたの選択した条件に合う人は <b>${population}</b> 人いるようね。<br>
            あなたが選択した「<b>${selectedAnswers[2]}</b>」に住む「<b>${selectedAnswers[1]}</b>」の<b>${selectedAnswers[0]}</b>の人数は、<br>
            <b>${sum_age_area_population}</b>人もいるのに、<br>
            あなたの理想に合う人は<b>${population_Rate}</b>％しかいないわよ。<br>
        `;
        resultsContainer.innerHTML = ``;
        const div = document.createElement('div');
        div.innerHTML = `※母数対象：未婚者。５人以上を雇用する事業所に勤める人。`;

        // resultsContainer.innerHTML = ``;
        // const div = document.createElement('div');
        // div.innerHTML = `
        //     あなたの選択した条件に合う人は <b>${population}</b> 人いるようね。<br>
        //     あなたが選択した「<b>${selectedAnswers[2]}</b>」に住む「<b>${selectedAnswers[1]}</b>」の<b>${selectedAnswers[0]}</b>の人数は、<br>
        //     <b>${sum_age_area_population}</b>人もいるのに、<br>
        //     あなたはそのうちの<b>${population_Rate}</b>％しか理想じゃないようね。<br>
        //     <br>
        //     ※対象<br>
        //     　　未婚者<br>
        //     　　５人以上を雇用する事業所に勤める人<br>
        // `;

        resultsContainer.appendChild(div);

        document.getElementById('resultsContainer').style.display = 'block';
        document.getElementById('resultButton').style.display = 'none';


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

    // スライダーの値が変更されたときの処理
    incomeSlider.addEventListener('input', function () {
        const value = incomeSlider.value;
        // incomeValue.textContent = `${value}万円～`;
        // sliderValue.textContent = value + '万円';
        if (value === '0') {
            incomeValue.textContent = "収入無しでもOK";
        } else {
            incomeValue.textContent = value + '万円以上';
        }
        selectedAnswers[currentQuestionIndex] = [value];
    });

    // 質問が変更されたときにスライダーを表示する関数
    function showSliderForIncomeQuestion() {
        if (currentQuestionIndex === 3) {
            sliderContainer.style.display = 'flex';
            const optionButtons = document.querySelectorAll('#options button');
            optionButtons.forEach(btn => btn.style.display = 'none'); // 選択肢ボタンを非表示にする
        } else {
            sliderContainer.style.display = 'none';
            const optionButtons = document.querySelectorAll('#options button');
            optionButtons.forEach(btn => btn.style.display = 'block'); // 選択肢ボタンを表示する
        }
        // showSelections();

    }

    // showQuestion関数の最後にスライダーの表示を更新するように追加
    //質問および選択肢の画面表示
    function showQuestion() {
        showQuestionList();

        if (currentQuestionIndex < questions.length) {
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
                button.innerText = option;
                button.classList.add('option-button');
                // console.log("button.classList:", button.classList); // クリックされたときのログ

                // クリックイベントを設定
                button.onclick = () => {
                    toggleOption(button, option, isMultipleChoice);

                    // デバッグ用ログ
                    console.log("Creating button for option:", option);
                    console.log("selectedAnswers:", selectedAnswers);

                    // 選択状態を反映
                    if (selectedAnswers[currentQuestionIndex] && selectedAnswers[currentQuestionIndex].includes(option)) {
                        button.classList.add('selected');
                    } else {
                        button.classList.remove('selected');
                    }
                    // showSelections();
                };

                // 質問10の場合のみツールチップを追加
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
        showSliderForIncomeQuestion();
    }


    // ボタンの選択状態を切り替える関数
    function toggleOption(button, option, isMultipleChoice) {
        // 質問4～11の場合の特定処理
        if (currentQuestionIndex >= 3 && currentQuestionIndex <= 9 && option === options[currentQuestionIndex][2]) {
            const optionButtons = document.querySelectorAll('#options button');
            const isFirstOptionSelected = button.classList.contains('selected');

            if (isFirstOptionSelected) {
                // 最初の選択肢が選択されている場合、すべての選択肢を解除
                optionButtons.forEach(btn => btn.classList.remove('selected'));
                selectedAnswers[currentQuestionIndex] = [];
            } else {
                // 最初の選択肢が選択されていない場合、すべての選択肢を選択
                optionButtons.forEach(btn => btn.classList.add('selected'));
                selectedAnswers[currentQuestionIndex] = options[currentQuestionIndex].slice(2);
            }

            // showSelections();
            return;     // 関数の実行を終了する
        }

        if (isMultipleChoice) {
            button.classList.toggle('selected');
            if (!selectedAnswers[currentQuestionIndex]) {
                selectedAnswers[currentQuestionIndex] = [];
            }
            const index = selectedAnswers[currentQuestionIndex].indexOf(option);

            if (index === -1) {
                //選択状態にした時の処理
                selectedAnswers[currentQuestionIndex].push(option);
            } else {
                //選択状態を解除したときの処理
                selectedAnswers[currentQuestionIndex].splice(index, 1);
            }

        } else {
            const optionButtons = document.querySelectorAll('#options button');
            optionButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedAnswers[currentQuestionIndex] = [option];

            if (currentQuestionIndex === 3) {
                income_selectedIndex = options[currentQuestionIndex].indexOf(option) - 2; // インデックスを格納（最初の2つの項目は除外）
            }
        }

        // 選択状態の選択肢を選択肢の順番に並び替える処理を追加
        if (selectedAnswers[currentQuestionIndex]) {
            selectedAnswers[currentQuestionIndex].sort((a, b) => {
                return options[currentQuestionIndex].indexOf(a) - options[currentQuestionIndex].indexOf(b);
            });
        }

        // showSelections();
        // showSliderForIncomeQuestion();  // スライダーの表示を更新
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
        alert('選択肢を選んでください。');
        return;
    }

    currentQuestionIndex++;
    showSelections();
    showQuestion();
}

//性別ごとに選択肢を変える処理
function setOptionsByGender() {
    console.log("selectedAnswers:", selectedAnswers); // デバッグ用
    if (selectedAnswers[0] && selectedAnswers[0][0] === '男性') {
        options[currentQuestionIndex] = optionsMale[currentQuestionIndex];
    } else {
        options[currentQuestionIndex] = optionsFem[currentQuestionIndex];
    }
}
