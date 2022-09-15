
import { qs, shuffle, whittle, highlightCopied } from "./modules.js";
import { Misspeller } from "../Misspeller.js";

const log = console.log;


function QuizBuilder(table, settingsSaver, settings = {}) {


    const quizSettings = qs("quiz-settings");
    const quizTypeSelect = qs("quiz-type-select");
    const choiceNumTypeSelect = qs("choice-number-type-select");
    const numChoicesSelect = qs("num-choices-select");
    const choicesOnSelect = qs("choices-on-select");
    const generateQuizButton = qs("generate-quiz-button");
    const copyButton = qs("copy-quiz-button");
    const textarea = qs("quiz-holder");
    const problemSpacingSelect = qs("problem-spacing-select");
    const allQuizSelects = document.querySelectorAll("#quiz-stuff select");
    const shuffleProblemsSelect = qs("shuffle-problems-select");
    const numProblemsInput = qs("num-problems-input");
    const kaitouRanSelect = qs("kaitou-ran-select");
    const autoGenerateQuizCheckbox = qs("auto-generate-quiz-checkbox");
    const toggleAdvancedCheckbox = qs("show-advanced-checkbox");


    const misspeller = new Misspeller();


    numProblemsInput.oninput = () => {
        numProblemsInput.value = Math.min(numProblemsInput.value, numProblemsInput.getAttribute("max"));
        if (autoGenerateQuizCheckbox.checked) this.generateQuiz();
    }


    allQuizSelects.forEach(input => input.addEventListener("change", () => {
        if (autoGenerateQuizCheckbox.checked) this.generateQuiz();
    }));


    const getNumberProblems = () => parseInt(numProblemsInput.value);


    settingsSaver.registerInput([
        quizTypeSelect.id,
        choiceNumTypeSelect.id,
        numChoicesSelect.id,
        choicesOnSelect.id,
        problemSpacingSelect.id,
        shuffleProblemsSelect.id,
        autoGenerateQuizCheckbox.id,
        toggleAdvancedCheckbox.id,
        kaitouRanSelect.id,
    ]);


    settingsSaver.onchange(autoGenerateQuizCheckbox.id, () => {
        if (autoGenerateQuizCheckbox.checked) this.generateQuiz();
    });


    settingsSaver.onchange(toggleAdvancedCheckbox.id, () => {
        quizSettings.classList.toggle("show-advanced", toggleAdvancedCheckbox.checked);
    });
    toggleAdvancedCheckbox.onchange();


    const choiceNumTypes = {
        abc: {
            quiz_symbol: ["A)", "B)", "C)", "D)"],
            answer_sheet_symbol: ["A", "B", "C", "D"],
        },
        numbers: {
            quiz_symbol: ["1)", "2)", "3)", "4)"],
            answer_sheet_symbol: [1, 2, 3, 4],
        },
        katakana: {
            quiz_symbol: ["ア)", "イ)", "ウ)", "エ)"],
            answer_sheet_symbol: ["ア", "イ", "ウ", "エ"],
        },
        squares: {
            quiz_symbol: ["□", "□", "□", "□"],
            answer_sheet_symbol: [1, 2, 3, 4],
        },
    };


    const kaitouRanText = {
        parentheses: "(　　　　　)",
        brackets: "[　　　　　]",
        line: "________",
        parentheses_with_line: "( _____ )",
    };


    copyButton.onclick = () => {

        if (!textarea.value) return alert("Build a quiz first!");

        navigator.clipboard.writeText(textarea.value).then(() => {

            const originalText = copyButton.innerHTML;
            copyButton.classList.remove("btn-primary");
            copyButton.classList.add("btn-success");
            copyButton.innerHTML = "Copied!";

            const restoreCopyButton = () => {
                copyButton.classList.remove("btn-success");
                copyButton.classList.add("btn-primary");
                copyButton.innerHTML = originalText;
            };

            ["keydown", "mousemove"].forEach(event => {
                window.removeEventListener(event, restoreCopyButton);
                window.addEventListener(event, restoreCopyButton);
            });

            highlightCopied({ elem: textarea, });
        });
    };


    this.buildNew = () => undefined;


    this.doAutomaticallyGenerateQuiz = () => autoGenerateQuizCheckbox.checked;


    this.setNumProblems = num => {
        numProblemsInput.setAttribute("max", num);
        numProblemsInput.value = numProblemsInput.getAttribute("max");
    };


    this.generateQuiz = () => {

        textarea.value = "";

        const rows = table.getActiveRows();
        const quizType = quizTypeSelect.value;
        const questionLanguage = quizType === "eiwa" ? settings.englishWordClass : settings.japaneseWordClass;
        const choiceLanguage = quizType === "eiwa" ? settings.japaneseWordClass : settings.englishWordClass;
        const numChoices = parseInt(numChoicesSelect.value);
        const problemSpacing = parseInt(problemSpacingSelect.value);
        const answerBreak = settings.answerBreak ?? "\n\n===================\n\nANSWERS\n\n";

        let string = "";
        let answers = "";


        if (!rows.length) return (() => textarea.value = "No items are selected...")();


        whittle(rows, getNumberProblems());
        if (shuffleProblemsSelect.value === "yes") shuffle(rows);
        rows.forEach((row, index) => newQuizRow(row, index));

        function getMisspelledFor(word) {
            return misspeller.getAllFor(word);
        }

        function processRow(row, index, choiceLanguage) {

            const correctAnswer = table.getWordByLanguage(row, choiceLanguage);
            const dummyAnswers = getDummyAnswers(correctAnswer, quizType);
            const english = table.getWordByLanguage(row, "english-word");

            return {
                correctAnswer,
                dummyAnswers,
                english,
                englishFirstLetter: english.charAt(0) + "__________________",
                japanese: table.getWordByLanguage(row, "japanese-word"),
                lineSpacing: (choicesOnSelect.value === "newline") ? "\n" : "\t",
                problemNumber: (index + 1) + ".",
                question: table.getWordByLanguage(row, questionLanguage),
                sentakushi: shuffle([correctAnswer, ...dummyAnswers]),
            };
        }

        function newQuizRow(row, index) {

            const r = processRow(row, index, choiceLanguage);

            string += `${r.problemNumber}\t${r.question}\n`;
            answers += `${r.problemNumber}\t${getAnswerSymbolFor(r.sentakushi, r.correctAnswer)}\n`;

            for (let i = 0; i < numChoices; i++) {
                if (i === 0 || choicesOnSelect.value === "newline") string += "\t";
                const sentakushiKigou = choiceNumTypes[choiceNumTypeSelect.value].quiz_symbol[i] + " ";
                string += sentakushiKigou + r.sentakushi[i];
                string += r.lineSpacing;
            }

            if (kaitouRanSelect.value) string += "\t" + kaitouRanText[kaitouRanSelect.value];

            string += "\n";

            for (let i = 0; i < problemSpacing; i++) string += "\n";
        }


        const getBlankWithFirstLetter = word => word.charAt(0);


        function getAnswerSymbolFor(sentakushi, correctAnswer) {
            const quizType = choiceNumTypeSelect.value
            const index = sentakushi.indexOf(correctAnswer);
            return choiceNumTypes[quizType].answer_sheet_symbol[index];
        }


        function getDummyAnswers(correctAnswer, quizType) {

            const allAnswers = quizType === "spelling" ?
                getMisspelledFor(correctAnswer) :
                table.getAllWords(choiceLanguage);
            const array = [];

            while (array.length < numChoices - 1) { // leaving one space for the correct answer
                const rand = Math.floor(Math.random() * allAnswers.length);
                if (allAnswers[rand] === correctAnswer) continue;
                array.push(allAnswers[rand]);
                allAnswers.splice(rand, 1);
            }

            return array;
        }


        textarea.value = string + answerBreak + answers;
    };


    generateQuizButton.onclick = () => {
        textarea.value = "";
        generateQuizButton.classList.remove("generating");
        generateQuizButton.classList.add("generating");
        setTimeout(() => {
            generateQuizButton.classList.remove("generating");
            this.generateQuiz();
        }, 500);
    };
}


export { QuizBuilder };
