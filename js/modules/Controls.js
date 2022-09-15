

import { qs } from "./modules.js";


function Controls(settingsSaver) {


    const log = console.log;


    const shuffleButton = qs("toggle-shuffle-checkbox");
    const copyButton = qs("copy-items-button");
    const rangeFrom = qs("range-from");
    const rangeTo = qs("range-to");


    settingsSaver.registerInput([rangeFrom.id, rangeTo.id]);
    settingsSaver.onchange(rangeFrom.id, () => this.onchange());
    settingsSaver.onchange(rangeTo.id, () => this.onchange());


    copyButton.onclick = () => this.copyItems();


    this.onchange = () => {
        log("Changing?");
    };


    this.onRangeChange = () => undefined;
    // this.submit = () => undefined;
    this.shuffle = () => undefined;
    this.getRange = () => {
        const v1 = parseInt(rangeFrom.value);
        const v2 = parseInt(rangeTo.value);
        return [Math.min(v1, v2), Math.max(v1, v2)];
    };
    this.copyItems = () => undefined;

    this.showSuccessfulCopy = () => {
        const orignalButtonText = copyButton.innerHTML;
        copyButton.innerHTML = "Copied!";
        copyButton.classList.add("btn-success");
        copyButton.classList.remove("btn-primary");
        ["keydown", "mousemove"].forEach(event => {
            window.addEventListener(event, () => {
                copyButton.innerHTML = orignalButtonText;
                copyButton.classList.remove("btn-success");
                copyButton.classList.add("btn-primary");
            });
        });
    };

    shuffleButton.onchange = () => this.shuffle(shuffleButton.checked);
}


export { Controls };
