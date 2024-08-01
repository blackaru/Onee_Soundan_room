let population_Males = [];
let population_Fems = [];
let Incm_Males = [];
let Incm_Fems = [];
let Incm_RevVals = [];
let bonus_Males = [];
let bonus_Fems = [];
let brothers = [];
let edu_Males = [];
let edu_Fems = [];
let lover_Males = [];
let lover_Fems = [];
let height_Males = [];
let height_Fems = [];
let body_Males = [];
let body_Fems = [];
let personalities = [];

let population = 0;
let sum_age_area_population = 0;
let population_Rate = 0;
let age_area_population = [];
let jobless_Rate = [];
let income_Rate = [];
let brother_Rate = [];;
let part_edu_Rate = [];
let edu_Rate = [];
let part_lover_Rate = [];
let lover_Rate = [];
let part_height_Rate = [];
let height_Rate = [];
let part_body_Rate = [];
let body_Rate = [];
let personality_Rate = [];;

let answers = [];


//csv読み込み
function loadCSV(fileName, folderPath, processFunc, callback) {
    const filePath = `${folderPath}/${fileName}`;
    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            const data = processFunc(text);
            callback(data);
        })
        .catch(error => console.error('Error loading CSV:', error));
}

//一度にcsvファイルを読み込み
function loadMultipleCSVFiles(files, folderPath, callback) {
    let filesLoaded = 0;
    const totalFiles = files.length;

    files.forEach(file => {
        loadCSV(file.name, folderPath, file.processFunc, (data) => {
            file.data = data;
            filesLoaded++;
            if (filesLoaded === totalFiles) {
                callback();
            }
        });
    });
}

// CSVデータを正規表現でパースする関数
function parseCSV(data) {
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    return data.trim().split('\n').map(line => line.split(regex).map(cell => cell.replace(/(^"|"$)/g, '').trim()).filter(cell => cell !== ''));
}

const calCsvFiles = [
    //結果計算用csv
    //  年齢、地域、婚姻、性別
    { name: 'population_Male.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    { name: 'population_Fem.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },

    //  年収_1（サブ：年齢、性別）
    { name: 'Incm_Male.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    { name: 'Incm_Fem.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    //  年収_2（サブ：地域）　月収補正
    { name: 'Incm_RevVal.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    // ボーナス_3（サブ：地域、年齢）　ボーナス補正
    { name: 'bonus_Male.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    { name: 'bonus_Fem.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    // 失業者_4（サブ：地域）
    { name: 'Incm_jobless.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },

    //　兄弟構成
    { name: 'brothers.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    //　学歴
    { name: 'gakureki_Male.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    { name: 'gakureki_Fem.csv', processFunc: text => text.trim().split('\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    //　恋人の有無
    { name: 'lover_Male.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    { name: 'lover_Fem.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    //　生活
    { name: 'lifestyle_Male.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    { name: 'lifestyle_Fem.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    //　身長
    { name: 'height_Male.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    { name: 'height_Fem.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    //　体型
    { name: 'body_Male.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    { name: 'body_Fem.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
    //  性格
    { name: 'personality.csv', processFunc: text => text.trim().split('\r\n').map(line => line.split(',').filter(cell => cell.trim() !== '')), data: null },
];

// window.onload = function () {
document.addEventListener("DOMContentLoaded", function () {
    const screenFolderPath = './csv';  // 読み込むフォルダパスを指定
    const calFolderPath = './csv';     // 読み込むフォルダパスを指定

    loadMultipleCSVFiles(screenCsvFiles, screenFolderPath, () => {
        // 画面表示用csv
        questions = screenCsvFiles[0].data;     // 質問文
        optionsMale = screenCsvFiles[1].data;       // 選択肢
        optionsFem = screenCsvFiles[2].data;       // 選択肢
        tooltips = screenCsvFiles[3].data;      // ツールチップ


        // 次に計算用CSVファイルを読み込む
        loadMultipleCSVFiles(calCsvFiles, calFolderPath, () => {
            // 計算用csv
            population_Males = calCsvFiles[0].data; // 年齢、性別、地域、婚姻(男)
            population_Fems = calCsvFiles[1].data;  // 年齢、性別、地域、婚姻(女)
            Incm_Males = calCsvFiles[2].data;       // 収入_1(男)
            Incm_Fems = calCsvFiles[3].data;        // 収入_1(女)
            Incm_RevVals = calCsvFiles[4].data;      // 収入_2
            bonus_Males = calCsvFiles[5].data;      // ボーナス_3           
            bonus_Fems = calCsvFiles[6].data;      // ボーナス_3           
            jobless = calCsvFiles[7].data;      // 失業者          
            brothers = calCsvFiles[8].data;      // 兄弟構成
            edu_Males = calCsvFiles[9].data;     // 学歴(男)
            edu_Fems = calCsvFiles[10].data;     // 学歴(女)
            lover_Males = calCsvFiles[11].data;      // 恋人の有無(男)
            lover_Fems = calCsvFiles[12].data;      // 恋人の有無(女)
            life_Males = calCsvFiles[13].data;   // 生活スタイル(男)
            life_Fems = calCsvFiles[14].data;   // 生活スタイル(女)
            height_Males = calCsvFiles[15].data;       // 身長
            height_Fems = calCsvFiles[16].data;       // 身長
            body_Males = calCsvFiles[17].data;         // 体型
            body_Fems = calCsvFiles[18].data;         // 体型
            personalities = calCsvFiles[19].data;// 性格

            // 画面表示用の質問を表示
            showQuestion();
        });
    });
});

function performCalculation(callback) {
    // population = calculatePopulation();
    [population, sum_age_area_population, population_Rate] = calculatePopulation();
    // 結果をcallback経由でscript.jsに返す
    callback(population, sum_age_area_population, population_Rate);
}

// // script.jsに計算結果を返すための関数
function calculatePopulation() {
    answers = {
        gender: selectedAnswers[0],
        age: selectedAnswers[1],
        region: selectedAnswers[2],
        income: selectedAnswers[3],
        // income: income_selectedIndex,
        brother: selectedAnswers[4],
        edu: selectedAnswers[5],
        lover: selectedAnswers[6],
        // life: selectedAnswers[7],
        height: selectedAnswers[7],
        body: selectedAnswers[8],
        personality: selectedAnswers[9]
    };

    //質問1,2,3（年齢、性別、地域）：ベース人口を求める
    //データ：年齢、地域   ファイル名：性別
    const targetAgeArea = answers.age.length * answers.region.length;
    if (answers.gender[0] === '男性') {
        age_area_population = calculateByTwoElements(population_Males, answers.age.length, 2, answers.age, answers.region.length, 3, answers.region);
    } else {
        age_area_population = calculateByTwoElements(population_Fems, answers.age.length, 2, answers.age, answers.region.length, 3, answers.region);
    }

    //質問4（年収）：該当の年収取得者の割合を求める
    jobless_Rate = calculateByOneElement(jobless, answers.region.length, 4, answers.region);
    let stdDevIncome = [];
    let aveIncome = [];
    let workerProportion = [];
    let proportionAboveTarget = [];
    const text1 = [];
    const text2 = [];
    text1[0] = '平均年収';
    text2[0] = '労働者割合';

    if (answers.income === '収入無しでもOK') {
        for (let e1 = 0; e1 < answers.age.length; e1++) {
            income_Rate[e1] = 1.0;
        }
    } else {
        //在学中の学生には収入がないものと見ているので、年収の回答が"収入無しでもOK"ではない場合は配列から”在学中”の要素を削除する(在学中で収入有の人はいないため)
        answers.edu = answers.edu.filter(item => item !== "在学中");
        // 正規分布の累積分布関数 (CDF) を使用して推定
        function normalCDF(x, ave, stdDev) {
            return (1 + math.erf((x - ave) / (Math.sqrt(2) * stdDev))) / 2;
        }
        aveIncome = calculateByThreeElements(Incm_Males, answers.age.length, 2, answers.age, answers.edu.length, 6, answers.edu, 1, 4, text1);
        workerProportion = calculateByThreeElements(Incm_Males, answers.age.length, 2, answers.age, answers.edu.length, 6, answers.edu, 1, 4, text2);
        // 二次元配列を初期化
        for (let i = 0; i < answers.edu.length; i++) {
            stdDevIncome[i] = new Array(answers.age.length).fill(0);
            proportionAboveTarget[i] = new Array(answers.age.length).fill(0);
        }
        for (let e1 = 0; e1 < answers.age.length; e1++) {
            for (let e2 = 0; e2 < answers.edu.length; e2++) {
                stdDevIncome[e2][e1] = aveIncome[e2][e1] * 0.25; // 平均年収の25%を標準偏差として仮定
                proportionAboveTarget[e2][e1] = 1 - normalCDF(answers.income[0], aveIncome[e2][e1], stdDevIncome[e2][e1]);  //回答した年収以上の人の割合を求める
                if (!income_Rate[e1]) {
                    income_Rate[e1] = 0; // 初期化
                }
                //選択済みの年齢および学歴に該当する人に対しての割合を求める
                income_Rate[e1] += Number(workerProportion[e2][e1]) * Number(proportionAboveTarget[e2][e1]);
            }
        }
    }

    //質問5（兄弟構成）：該当の兄弟構成の人の割合を求める
    let sum_brotherRate = 0;
    if (answers.brother[0] === '気にしない') {
        brother_Rate = 1;
    } else {
        brother_Rate = calculateByOneElement(brothers, answers.brother.length, 5, answers.brother)
    }
    for (let e1 = 0; e1 < answers.brother.length; e1++) {
        sum_brotherRate += parseFloat(brother_Rate[e1]);
    }

    // 質問6（学歴）：該当の学歴の人の割合を求める
    if (answers.gender[0] === '男性') {
        //年齢が２つ、地域が２つ指定された時に４つのedu_rateが取得できるか要確認
        edu_Rate = calculateByThreeElements(edu_Males, answers.age.length, 2, answers.age, answers.region.length, 3, answers.region, answers.edu.length, 6, answers.edu);
    } else {
        edu_Rate = calculateByThreeElements(edu_Fems, answers.age.length, 2, answers.age, answers.region.length, 3, answers.region, answers.edu.length, 6, answers.edu);
    }


    // 質問7（交際状況）：該当の交際状況の人の割合を求める
    let ageForLover = [];
    for (let k = 0; k < answers.age.length; k++) {
        //データがない場合は全年齢の値を使用するための準備
        if (answers.age[k] === '～19歳' ||
            answers.age[k] === '50歳～54歳' ||
            answers.age[k] === '55歳～59歳' ||
            answers.age[k] === '60歳～64歳' ||
            answers.age[k] === '65歳～69歳' ||
            answers.age[k] === '70歳～') {
            ageForLover[k] = '全年齢';
        } else {
            ageForLover[k] = answers.age[k];
        }
    }
    if (answers.gender[0] === '男性') {
        part_lover_Rate = calculateByTwoElements(lover_Males, ageForLover.length, 2, ageForLover, answers.lover.length, 7, answers.lover);
    } else {
        part_lover_Rate = calculateByTwoElements(lover_Fems, ageForLover.length, 2, ageForLover, answers.lover.length, 7, answers.lover);
    }
    for (let e1 = 0; e1 < answers.age.length; e1++) {
        for (let e2 = 0; e2 < answers.lover.length; e2++) {
            if (!lover_Rate[e1]) {
                lover_Rate[e1] = 0; // 初期化
            }
            lover_Rate[e1] += part_lover_Rate[e2][e1];
        }
    }

    // 質問8（実家暮らし）：該当の暮らしの人の割合を求める
    //実家暮らしかどうかのデータ取得不可のため、なし

    // 質問8（身長）：該当の身長の人の割合を求める
    if (answers.gender[0] === '男性') {
        //年齢が２つ指定された時に2つのheight_Rateを取得する
        part_height_Rate = calculateByTwoElements(height_Males, answers.age.length, 2, answers.age, answers.height.length, 8, answers.height);
    } else {
        part_height_Rate = calculateByTwoElements(height_Fems, answers.age.length, 2, answers.age, answers.height.length, 8, answers.height);
    }
    for (let e1 = 0; e1 < answers.age.length; e1++) {
        for (let e2 = 0; e2 < answers.height.length; e2++) {
            if (!height_Rate[e1]) {
                height_Rate[e1] = 0; // 初期化
            }
            height_Rate[e1] += part_height_Rate[e2][e1];
        }
    }


    // 質問9（体型）：該当の体型の人の割合を求める
    if (answers.gender[0] === '男性') {
        //年齢が２つ指定された時に2つのheight_Rateを取得する
        part_body_Rate = calculateByTwoElements(body_Males, answers.age.length, 2, answers.age, answers.body.length, 9, answers.body);
    } else {
        part_body_Rate = calculateByTwoElements(body_Fems, answers.age.length, 2, answers.age, answers.body.length, 9, answers.body);
    }
    //選択された年齢の数だけ配列に格納していく
    for (let e1 = 0; e1 < answers.age.length; e1++) {
        for (let e2 = 0; e2 < answers.gender.length; e2++) {
            if (!body_Rate[e1]) {
                body_Rate[e1] = 0; // 初期化
            }
            body_Rate[e1] += part_body_Rate[e2][e1];
        }
    }

    // 質問10（性格）：該当の性格の人の割合を求める
    let sum_personalityRate = 0;
    if (answers.personality[0] === '気にしない') {
        personality_Rate = 1;
    } else {
        personality_Rate = calculateByOneElement(personalities, answers.personality.length, 10, answers.personality)
    }
    for (let e1 = 0; e1 < answers.personality.length; e1++) {
        sum_personalityRate += parseFloat(personality_Rate[e1]);
    }

    console.log("age_area_population:", age_area_population);
    console.log("jobless_Rate:", jobless_Rate);
    console.log("income_Rate:", income_Rate);
    console.log("brother_Rate:", brother_Rate);
    console.log("sum_brotherRate:", sum_brotherRate);
    console.log("edu_Rate:", edu_Rate);
    console.log("lover_Rate:", lover_Rate);
    console.log("height_Rate:", height_Rate);
    console.log("body_Rate:", body_Rate);
    console.log("personality_Rate:", personality_Rate);
    console.log("sum_personalityRate:", sum_personalityRate);

    let population_array_1 = [];
    let population_array_2 = [];

    // 二次元配列を初期化
    for (let i = 0; i < answers.region.length; i++) {
        population_array_1[i] = new Array(answers.age.length).fill(0);
        population_array_2[i] = new Array(answers.age.length).fill(0);
    }
    for (let e1 = 0; e1 < answers.age.length; e1++) {
        for (let e2 = 0; e2 < answers.region.length; e2++) {

            console.log("[e2][e1]=[%d][%d]", e2, e1);
            console.log("age_area_population[e2][e1]=：", age_area_population[e2][e1]);
            console.log("jobless_Rate[e2]=：", jobless_Rate[e2]);


            //地域に影響する要素（失業者）を差し引く
            population_array_1[e2][e1] = age_area_population[e2][e1] * (1 - jobless_Rate[e2]);
            //年齢に影響する要素に対する割合をかける
            population_array_2[e2][e1] = population_array_1[e2][e1] * income_Rate[e1] * lover_Rate[e1] * height_Rate[e1] * body_Rate[e1];
            //年齢と地域の両方に影響する要素に対する割合をかける
            population += population_array_2[e2][e1] * edu_Rate[e2][e1];
            sum_age_area_population += age_area_population[e2][e1];

            console.log("population_array_1[e2][e1]=：", population_array_1[e2][e1]);
            console.log("population_array_2[e2][e1]=：", population_array_2[e2][e1]);
            console.log("population+=：", population);
        }
    }

    console.log("sum_age_area_population:", sum_age_area_population);
    console.log("sum_personalityRate:", sum_personalityRate);

    population = population * sum_brotherRate * sum_personalityRate;
    population_Rate = population / sum_age_area_population * 100;

    console.log("population * brother_Rate* personality_Rate:", population);


    population = Math.round(population);
    population_Rate = population / sum_age_area_population * 100;
    console.log("population_Rate:", population_Rate);

    sum_age_area_population = sum_age_area_population.toLocaleString();
    population_Rate = roundTo(population_Rate, 2);

    console.log("sum_age_area_population.toLocaleString():", sum_age_area_population);
    console.log("roundTo(population_Rate):", population_Rate);

    console.log("Math.round(population)(population):", population);
    console.log("answers:", answers);

    return [population, sum_age_area_population, population_Rate];

}

function calculateByThreeElements(csvArray, e1SelectedNum, rowQuestionNum, firstRowKey, e2SelectedNum, columnQuestionNum1, ColumnKey1, e3SelectedNum, columnQuestionNum2, ColumnKey2) {
    let array_three = [];
    const columnCount = (options[columnQuestionNum1 - 1].length - 2) * (options[columnQuestionNum2 - 1].length - 2);
    // 二次元配列を初期化
    for (let i = 0; i < e2SelectedNum; i++) {
        array_three[i] = new Array(e1SelectedNum).fill(0);
    }
    for (let e1 = 0; e1 < e1SelectedNum; e1++) {
        for (let i = 1; i < options[rowQuestionNum - 1].length - 2; i++) { // 1行目はヘッダーなのでスキップ
            if (firstRowKey[e1] === csvArray[0][i]) {
                let column = i;
                //列キーの選択肢文ループ
                for (let e2 = 0; e2 < e2SelectedNum; e2++) {
                    for (let e3 = 0; e3 < e3SelectedNum; e3++) {
                        for (let j = 0; j < columnCount; j++) {
                            // 列の各項目と列キーとを照らし合わせて行番を決定
                            if (ColumnKey1[e2] === csvArray[j][0] && ColumnKey2[e3] === csvArray[j][1]) {
                                let row = j;
                                //ColumnKey1とfirstRowKeyの2次元配列として返す
                                if (e3SelectedNum !== 1) {
                                    //複数選択された場合、年齢ごとに足しこんでから返す
                                    array_three[e2][e1] += parseFloat(csvArray[row][column]);
                                } else {
                                    array_three[e2][e1] = parseFloat(csvArray[row][column]);
                                }
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }
    }
    return array_three;
}

//何個目の質問か（QuestionNum）、参照したいCSVデータを格納した配列名（csvArray）、行のキー（firstRowKey）、列のキー（firstColumnKey）を引数するとする
function calculateByTwoElements(csvArray, e1SelectedNum, rowQuestionNum, firstRowKey, e2SelectedNum, columnQuestionNum, firstColumnKey) {
    let array_two = [];
    for (let i = 0; i < e2SelectedNum; i++) {
        array_two[i] = new Array(e1SelectedNum).fill(0);
    }
    //行キーの選択肢文ループ
    for (let e1 = 0; e1 < e1SelectedNum; e1++) {
        for (let i = 0; i < options[rowQuestionNum - 1].length - 2; i++) {
            //行の各項目と行キーとを照らし合わせて列番を決定
            if (firstRowKey[e1] === csvArray[0][i]) {
                let column = i;
                //列キーの選択肢文ループ
                for (let e2 = 0; e2 < e2SelectedNum; e2++) {
                    for (let j = 0; j < options[columnQuestionNum - 1].length - 2; j++) {
                        // 列の各項目と列キーとを照らし合わせて行番を決定
                        if (firstColumnKey[e2] === csvArray[j][0]) {
                            let row = j;
                            array_two[e2][e1] = parseFloat(csvArray[row][column]);
                            break;
                        }
                    }
                }
                break;
            }
        }
    }
    return array_two;
}

//何個目の質問か（QuestionNum）、参照したいCSVデータを格納した配列名（csvArray）、行のキー（firstRowKey）、列のキー（firstColumnIndex）を引数するとする
function calculateByTwoElementsWithIndex(csvArray, e1SelectedNum, rowQuestionNum, firstRowKey, e2SelectedNum, columnQuestionNum, firstColumnIndex) {
    let array_twoIndex = [];
    for (let i = 0; i < e2SelectedNum; i++) {
        array_twoIndex[i] = new Array(e1SelectedNum).fill(0);
    }
    //行キーの選択肢文ループ
    for (let e1 = 0; e1 < e1SelectedNum; e1++) {
        for (let i = 0; i < options[rowQuestionNum - 1].length - 2; i++) {
            let column;
            let row;
            //行の各項目と行キーとを照らし合わせて列番を決定
            if (firstRowKey[e1] === csvArray[0][i]) {
                column = i;
                //行はIndexで取得してきているため、そのままrowに代入
                for (let e2 = 0; e2 < e2SelectedNum; e2++) {
                    if (columnQuestionNum && columnQuestionNum === 4) {
                        row = firstColumnIndex + 1;
                    } else {
                        row = null;   //収入以外にこの関数が使われた場合エラーとする  
                    }
                    // if (!array_twoIndex[e2]) array_twoIndex[e2] = []; // 初期化
                    if (e2SelectedNum !== 1) {
                        //複数選択された場合、年齢ごとに足しこんでから返す
                        array_twoIndex[e2][e1] += parseFloat(csvArray[row][column]);
                    } else {
                        array_twoIndex[e2][e1] = parseFloat(csvArray[row][column]);
                    }
                }
                break;
            }
        }
    }
    return array_twoIndex;
}


//要素が一つのcsvを参照する場合の関数
function calculateByOneElement(csvArray, e1SelectedNum, columnQuestionNum, firstColumnKey) {
    let array_one = [];
    for (let i = 0; i < e1SelectedNum; i++) {
        array_one[i] = 0;
    }
    //列キーの選択肢文ループ
    for (let e1 = 0; e1 < e1SelectedNum; e1++) {
        for (let i = 0; i < options[columnQuestionNum - 1].length - 2; i++) {
            // 列の各項目と列キーとを照らし合わせて行番を決定
            if (firstColumnKey[e1] === csvArray[i][0]) {
                const row = i;
                // if (!array_one[e1]) array_one[e1] = []; // 初期化
                if (e1SelectedNum !== 1) {
                    //複数選択された場合、年齢ごとに足しこんでから返す
                    array_one[e1] += parseFloat(csvArray[row][1]);
                } else {
                    array_one[e1] = parseFloat(csvArray[row][1]);
                }
                break;
            }
        }
    }
    return array_one;
}

function arrayDefaultfor2D(arrayName, rowValue, columnValue) {
    if (!arrayName[columnValue]) {
        arrayName[columnValue] = 0; // 初期化
    }
    if (arrayName[rowValue][columnValue] === undefined) {
        arrayName[rowValue][columnValue] = 0;
    }
}

//小数点以下の桁数を指定して四捨五入する関数
function roundTo(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}