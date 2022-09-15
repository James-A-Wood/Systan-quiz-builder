
import { systanWords } from "./shisutan_words.js";
import { qs, SettingsSaver } from "./modules/modules.js";
import { QuizBuilder } from "./modules/Quiz.js";
import { Table } from "./modules/Table.js";
import { Controls } from "./modules/Controls.js";
import "./libraries/jquery.js";


const log = console.log;


const systanController = new SystanController(Table, Controls, QuizBuilder, SettingsSaver);
function SystanController(Table, Controls, QuizBuilder, SettingsSaver) {


    const englishWordClass = "english-word";
    const japaneseWordClass = "japanese-word";


    const settingsSaver = new SettingsSaver();
    const table = new Table("#words-table", systanWords, { englishWordClass, japaneseWordClass, });
    const controls = new Controls(settingsSaver);
    const copyTargetSelect = qs("copy-target-select");
    const quizBuilder = new QuizBuilder(table, settingsSaver, { englishWordClass, japaneseWordClass });
    const body = document.querySelector("body");


    quizBuilder.buildNew = () => {
        const num = table.getActiveRows().length;
        quizBuilder.setNumProblems(num);
        if (quizBuilder.doAutomaticallyGenerateQuiz()) quizBuilder.generateQuiz();
        qs("max-number-problems").innerHTML = num;
    };


    settingsSaver.registerInput(copyTargetSelect.id);


    // line numbers
    qs(".line-number").forEach((td, index) => td.innerHTML = (index + 1) + ". ");


    table.getRange = controls.getRange;
    table.onTableBuild = () => quizBuilder.buildNew();
    table.onToggleActive = () => quizBuilder.buildNew();


    controls.shuffle = doShuffle => {
        table.randomizeRows(doShuffle);
        body.classList.toggle("shuffled", !table.rowsAreSorted());
    };
    controls.onchange = table.displayRows;


    function updateNumActive() {
        const numActive = table.getActiveRows().length;
        qs("num-active-holder").innerHTML = `(x${numActive})`;
        window.requestAnimationFrame(updateNumActive);
    }
    updateNumActive();


    function getCopyTarget() {
        return {
            english: copyTargetSelect.value.includes("english"),
            japanese: copyTargetSelect.value.includes("japanese"),
        };
    }


    controls.copyItems = () => {

        if (!table.getActiveRows().length) return alert("Please select some items to copy!");

        const doEnglish = getCopyTarget().english;
        const doJapanese = getCopyTarget().japanese;

        let wordsList = "";

        table.getActiveRows().forEach((item, index) => {
            const english = table.getEnglish(item);
            const japanese = table.getJapanese(item);
            if (doEnglish) wordsList += english;
            if (doEnglish && doJapanese) wordsList += "\t";
            if (doJapanese) wordsList += japanese;
            if (index !== table.getActiveRows().length - 1) wordsList += "\n";
        });

        navigator.clipboard.writeText(wordsList).then(() => {
            table.highlightCopiedRows({ "english-word": doEnglish, "japanese-word": doJapanese });
            controls.showSuccessfulCopy();
        }, () => alert("Something went wrong!"));

        return false;
    };


    document.querySelectorAll(".language-button").forEach(button => {
        button.onclick = () => {
            body.classList.toggle("japanese-mode", button.classList.contains("english"));
            body.classList.toggle("english-mode", button.classList.contains("japanese"));
            localStorage.systan_language = button.classList.contains("english") ? "japanese-mode" : "english-mode";
        };
    });
    body.classList.add(localStorage.systan_language ?? "english-mode");


    table.displayRows();
}
