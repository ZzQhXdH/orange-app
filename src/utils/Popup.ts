import { MoveableEle, createLabel } from "./html_ele";
import '../style/popup.css';

export class Popup extends MoveableEle {

    constructor(text: string, timeout: number = 500) {
        super('popup_ele');
        this.add(createLabel(text));
        this.show();

        setTimeout(() => {
            this.close();
        }, timeout);
    }
}

export function showToast(msg: string, timeout = 500) {
    new Popup(msg, timeout);
}


