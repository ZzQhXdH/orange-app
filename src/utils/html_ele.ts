
export function createDiv(...clz: string[]): HTMLDivElement {
    const ele = document.createElement('div');
    ele.classList.add(...clz);
    return ele;
}

export function createLabel(text: string, ...clz: string[]): HTMLLabelElement {
    const ele = document.createElement('label');
    ele.innerText = text;
    ele.classList.add(...clz);
    return ele;
}

export class MoveableEle {

    protected ele: HTMLDivElement;

    constructor(...clz: string[]) {
        this.ele = createDiv(...clz);
    }

    protected add(node: HTMLElement) {
        this.ele.appendChild(node);
    }

    protected show() {
        document.addEventListener('mouseup', this.mouseUp);
        this.ele.addEventListener('mousedown', this.mouseDown);
        document.addEventListener('mousemove', this.mouseMove);
        document.body.appendChild(this.ele);
    }

    close() {
        document.removeEventListener('mouseup', this.mouseUp);
        this.ele.removeEventListener('mousedown', this.mouseDown);
        document.removeEventListener('mousemove', this.mouseMove);
        document.body.removeChild(this.ele);
    }

    private dragFlag = false;
    private offsetX = 0;
    private offsetY = 0;

    private mouseDown = this.onMouseDown.bind(this);
    private mouseMove = this.onMouseMove.bind(this);
    private mouseUp = this.onMouseUp.bind(this);

    private onMouseDown(e: MouseEvent) {
        this.dragFlag = true;
        const rect = this.ele.getBoundingClientRect();
        this.offsetX = e.clientX - (rect.left + rect.width / 2);
        this.offsetY = e.clientY - (rect.top + rect.height / 2);
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.dragFlag) {
            return;
        }
        const x = e.clientX - this.offsetX;
        const y = e.clientY - this.offsetY;
        this.ele.style.left = `${x}px`;
        this.ele.style.top = `${y}px`;
    }

    private onMouseUp(_: MouseEvent) {
        this.dragFlag = false;
    }

}
