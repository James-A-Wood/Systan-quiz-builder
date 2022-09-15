
import { qs, shuffle, highlightCopied } from "./modules.js";


function Table(id, data, settings = {}) {

    const log = console.log;

    const table = qs(`${id} tbody`);
    const rowClass = settings.rowClass ?? ".items-row";
    const englishWordClass = settings.englishWordClass;
    const japaneseWordClass = settings.japaneseWordClass;
    const checkboxClass = ".is-active-checkbox";
    const toggleActiveButton = qs("toggle-all-checkbox");
    const rowTemplate = table.querySelector(rowClass).cloneNode(true);
    table.querySelector(rowClass).remove();
    toggleActiveButton.onclick = () => {
        toggleActiveRows();
        this.onToggleActive();
    };

    this.onTableBuild = () => undefined;
    this.onToggleActive = () => undefined;

    this.rowsAreSorted = () => {
        return getAllRows().every(row => {
            const thisRowNumber = this.getRowNumber(row);
            const nextRowNumber = this.getRowNumber(row?.nextSibling);
            if (!thisRowNumber || !nextRowNumber) return true;
            return thisRowNumber < nextRowNumber;
        });
    };

    this.getAllWords = language => {
        const array = [];
        this.getActiveRows().forEach(row => {
            const word = this.getWordByLanguage(row, language);
            array.push(word);
        });
        return array;
    };

    this.randomizeRows = doShuffle => doShuffle ? addRows(shuffle(getAllRows())) : this.unshuffleRows();

    this.unshuffleRows = () => {
        const rowsInOrder = getAllRows().sort((r1, r2) => {
            const n1 = parseInt(this.getRowNumber(r1));
            const n2 = parseInt(this.getRowNumber(r2));
            return n1 < n2 ? -1 : (n1 > n2 ? 1 : 0);
        });
        addRows(rowsInOrder);
    }

    this.getRowNumber = row => parseInt(row?.querySelector(".item-number")?.innerHTML);
    this.getWordByLanguage = (row, language) => row?.querySelector(`.${language}`)?.innerHTML;
    this.getEnglish = row => this.getWordByLanguage(row, settings.englishWordClass);
    this.getJapanese = row => this.getWordByLanguage(row, settings.japaneseWordClass);
    this.getActiveRows = () => getAllRows().filter(row => row.querySelector(checkboxClass).checked);

    this.highlightCopiedRows = (obj = {}) => {
        document.querySelectorAll(".word-cell").forEach(cell => highlightCopied({ elem: cell, }));
    };

    this.getWordsList = () => {
        const activeItems = this.getActiveRows();
        log(activeItems);
    };

    this.displayRows = () => {
        emptyTable();
        const range = this.getRange();
        const from = Math.min(range[0], range[1]);
        const to = Math.max(range[0], range[1]);
        if (Math.abs(from - to) <= 1) return log("Too narrow!", from, to);
        const words = Object.keys(data).filter(key => key >= from && key <= to);
        words.forEach(number => newTableRow(number, data[number]));
        this.onTableBuild();
    };

    function toggleActiveRows() {
        const numActive = table.querySelectorAll(checkboxClass + ":checked").length;
        const setToValue = numActive === 0 ? true : false;
        table.querySelectorAll(checkboxClass).forEach(checkbox => checkbox.checked = setToValue);
    }

    function emptyTable() {
        table.querySelectorAll(rowClass).forEach(row => row.remove());
    }

    const addRows = rowsArray => {
        emptyTable();
        rowsArray.forEach(row => table.appendChild(row));
    };

    const newTableRow = (number, obj = {}) => {
        if (!obj.english || !obj.japanese) return log("Bad data, bitch!");
        const newRow = rowTemplate.cloneNode(true);
        newRow.querySelector(`.${settings.englishWordClass}`).innerHTML = obj.english;
        newRow.querySelector(`.${settings.japaneseWordClass}`).innerHTML = obj.japanese;
        newRow.querySelector(".item-number").innerHTML = number;
        newRow.querySelector(".is-active-checkbox").onchange = this.onToggleActive;
        table.appendChild(newRow);
    };

    function getAllRows() {
        return Array.from(table.querySelectorAll(rowClass));
    }
}

export { Table };
