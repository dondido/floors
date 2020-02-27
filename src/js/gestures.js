class Gesture {
    constructor(props) {
        Object.assign(this, props);
    }
    attach() {
        document.body.onpointerdown = this.pointerdown;
        document.body.onpointerup = this.pointerup;
        document.body.onpointercancel =this.pointerup;
        /* document.body.onpointerout = this.pointerup; */
    }
}
export class Measure extends Gesture {
    constructor(props) {
        super(props);
    }
    pointerdown = (e) => {
        if(e.target.closest('.port')) {
            if(Number.isInteger(this.x1) === false) {
                this.x1 = e.clientX;
                this.y1 = e.clientY;
                document.body.onpointermove = this.pointermove;
            }
            else {
                this.pointermove(e);
                this.pointerup();
            }
        }
    }
    toFt(value) {
        const { $scene, $view, plan } = this;
        const { sy, z } = $view.dataset;
        const widthRatio = $scene.clientWidth / $scene.width.baseVal.value;
        const ratio = widthRatio === 1 ? $scene.clientHeight / $scene.height.baseVal.value : widthRatio;
        const [feet, inches = '0'] = String(value / (ratio * plan.footRatio * sy * z)).split('.');
        return `${feet}' ${Math.round(inches[0] * 1.2)}''`;
    }
    pointermove = ({ clientX, clientY }) => {
        const { $ruler, $foots } = this;
        const width = Math.abs(this.x1 - clientX);
        const height = Math.abs(this.y1 - clientY);
        $ruler.classList.remove('width', 'height');
        if(width > height) {
            $ruler.style.top = `${this.y1}px`;
            $ruler.style.left = `${Math.min(this.x1, clientX)}px`;
            $ruler.style.width = `${width}px`;
            $ruler.classList.add('width', 'apply');
            $foots.textContent = this.toFt(width);
        }
        else {
            $ruler.style.top = `${Math.min(this.y1, clientY)}px`;
            $ruler.style.left = `${this.x1}px`;
            $ruler.style.height = `${height}px`;
            $ruler.classList.add('height', 'apply');
            $foots.textContent = this.toFt (height);
        }
    }
    pointerup = () => {
        this.x1 = null;
        this.y1 = null;
        document.body.onpointermove = null;
    }
}
export class Drag extends Gesture {
    constructor(props) {
        super(props);
    }
    pointers = []
    initialZoom = 0
    pointerup = () => {
        this.pointers = [];
        this.hypo = 0;
        document.body.onpointermove = null;
    }
    pointerdown = (e) => {
        const $target = e.target.closest('.draggable');
        if(this.pointers.length === 0 && $target) {
            const { x = 0, y = 0 } = $target.dataset;
            this.$target = $target;
            this.x1 = e.clientX - x;
            this.y1 = e.clientY - y;
            this.initialZoom = + this.$zoomSlider.value;
            document.body.onpointermove = this.pointermove;
        }
        this.pointers.push(e);
    }
    pointermove = (e) => {
        const [ e1, e2, e3 ] = this.pointers;
        const { $target } = this;
        if(e3) {
            return;
        }
        if(e2 && $target.classList.contains('pinchable')) {
            let e4;
            if (e.pointerId === e1.pointerId) {
                e4 = e2;
                this.pointers[0] = e;
            }
            else {
                e4 = e1;
                this.pointers[1] = e;
            }
            const hypo1 = Math.hypot(e4.clientX - e.clientX, e4.clientY - e.clientY);
            this.hypo = this.hypo || hypo1;
            this.$zoomSlider.value = this.initialZoom + Math.min(1, hypo1/this.hypo - 1) * 100;
            return this.zoom();
        }
        this.x2 = this.x1 - e.clientX;
        this.y2 = this.y1 - e.clientY;
        $target.dataset.x = $target.offsetLeft - this.x2;
        $target.dataset.y = $target.offsetTop - this.y2;
        this.setTransform($target);
    }
}