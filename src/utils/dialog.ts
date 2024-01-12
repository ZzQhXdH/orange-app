import { delay } from "./util";
import { Error } from "../conn/error";


function createElement(text: string, ...clzs: string[]) {
    const ele = document.createElement('div');
    ele.innerText = text;
    ele.classList.add(...clzs);
    return ele;
}

class Dialog {

    btnClose = createElement('', 'close_btn');
    divTitle: HTMLDivElement;
    divImage: HTMLDivElement;
    divMsg: HTMLDivElement;
    dialog: HTMLDivElement;

    constructor(title: string, msg: string) {
        this.dialog = createElement('', 'dialog', 'col');
        let row = createElement('', 'dialog_title');
        this.dialog.appendChild(row);

        this.divTitle = createElement(title);

        row.appendChild( createElement('', 'dialog_70') );
        row.appendChild( this.divTitle );
        row.appendChild( this.btnClose );

        row = createElement('', 'row_center', 'mt10');
        this.dialog.appendChild(row);
        this.divImage = createElement('', 'dialog_err');
        this.divMsg = createElement(msg, 'ml10', 'dialog_msg');

        row.appendChild(this.divImage);
        row.appendChild(this.divMsg);

        this.show();
    }

    prog(msg: string) {
        this.divMsg.innerText = msg;
        this.divImage.classList.remove(...this.divImage.classList);
        this.divImage.classList.add('dialog_prog');
    }

    success(msg: string) {
        this.divMsg.innerText = msg;
        this.divImage.classList.remove(...this.divImage.classList);
        this.divImage.classList.add('dialog_succ');
        this.divImage.style.transform = `rotate(0deg)`;
    }

    warn(msg: string) {
        this.divMsg.innerText = msg;
        this.divImage.classList.remove(...this.divImage.classList);
        this.divImage.classList.add('dialog_warn');
        this.divImage.style.transform = `rotate(0deg)`;
    }

    error(msg: string) {
        this.divMsg.innerText = msg;
        this.divImage.classList.remove(...this.divImage.classList);
        this.divImage.classList.add('dialog_err');
        this.divImage.style.transform = `rotate(0deg)`;
    }

    show() {
        this.btnClose.onclick = ()=>{
            this.close();
        };
        this.dialog.classList.add('dialog_show');
        document.addEventListener('mouseup', this.mouseUp);
        this.dialog.addEventListener('mousedown', this.mouseDown);
        document.addEventListener('mousemove', this.mouseMove);
        document.body.appendChild(this.dialog);
    }

    close() {
        document.removeEventListener('mouseup', this.mouseUp);
        this.dialog.removeEventListener('mousedown', this.mouseDown);
        document.removeEventListener('mousemove', this.mouseMove);
        this.dialog.classList.remove('dialog_show');
        this.dialog.offsetWidth;
        this.dialog.classList.add('dialog_close');
        this.dialog.addEventListener('animationend', ()=>{
            document.body.removeChild(this.dialog);
        });
    }

    err(s: any) {
        if (s instanceof Error) {
            this.error( s.msg );
        } else {
            this.error ( s as string );
        }
    }

    private dragFlag = false;
    private offsetX = 0;
    private offsetY = 0;

    private mouseDown = this.onMouseDown.bind(this);
    private mouseMove = this.onMouseMove.bind(this);
    private mouseUp = this.onMouseUp.bind(this);

    private onMouseDown(e: MouseEvent) {
        this.dragFlag = true;
        const rect = this.dialog.getBoundingClientRect();
        this.offsetX = e.clientX - (rect.left + rect.width / 2);
        this.offsetY = e.clientY - (rect.top + rect.height / 2);
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.dragFlag) {
            return;
        }
        const x = e.clientX - this.offsetX;
        const y = e.clientY - this.offsetY;
        this.dialog.style.left = `${x}px`;
        this.dialog.style.top = `${y}px`;
    }

    private onMouseUp(_: MouseEvent) {
        this.dragFlag = false;
    }
}


export function showDialog(title: string, msg: string) {
    const dialog = new Dialog(title, msg);
    dialog.show();
    return dialog;
}

export async function runAction(title: string, msg: string, f: (_: Dialog) => Promise<void>) {
    const dialog = new Dialog(title, msg);
    try {
        dialog.prog(msg);
        await f(dialog);
        dialog.success("成功");
        await delay(800);
        dialog.close();
    } catch (msg) {
        dialog.err(msg);
    }
}

export function showErr(msg: any, title: string = "错误") {
    const dialog = new Dialog(title, msg);
    dialog.err(msg);
}

export async function runAsync(f: ()=> Promise<void>) {
    try {
        await f();
    } catch (e) {
        showErr(e);
    }
}









