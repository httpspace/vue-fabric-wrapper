const OBJECT_EVENTS = [
    "added",
    "removed",
    "selected",
    "deselected",
    "modified",
    "moved",
    "scaled",
    "rotated",
    "skewed",
    "rotating",
    "scaling",
    "moving",
    "skewing",
    "mousedown",
    "mouseup",
    "mouseover",
    "mouseout",
    "mousewheel",
    "mousedblclick",
    "dragover",
    "dragenter",
    "dragleave",
    "drop"
];

//Props to change via interaction and need to be emitted for prop.sync usage
const EMIT_PROPS = ["angle", "height", "left", "originX", "originY", "scaleX", "scaleY", "skewX", "skewY", "top"];

const watchEmitProp = (key, deep) => ({
    handler(newValue) {
        //If the prop caused the update there is no point emitting it back
        console.log("watch fired", key, newValue);
        if (this.$props[key] === newValue) {
            return;
        }
        this.$emit("update:" + key, newValue);
    },
    deep
});
export default {
    name: "fabric-object",
    inheritAttrs: false,
    props: {
        id: { type: [Number, String], required: true },
        angle: Number,
        backgroundColor: String,
        borderColor: String,
        borderDashArray: Array,
        borderOpacityWhenMoving: Number,
        borderScaleFactor: Number,
        cacheProperties: Array,
        centeredRotation: { type: Boolean, default: true },
        centeredScaling: { type: Boolean, default: false },
        //clipPath :fabric.Object,
        cornerColor: String,
        cornerDashArray: Array,
        cornerSize: Number,
        cornerStrokeColor: String,
        cornerStyle: String,
        dirty: { type: Boolean, default: true },
        evented: { type: Boolean, default: true },
        excludeFromExport: { type: Boolean, default: false },
        fill: String,
        fillRule: String,
        flipX: Boolean,
        flipY: Boolean,
        globalCompositeOperation: String,
        hasBorders: { type: Boolean, default: true },
        hasControls: { type: Boolean, default: true },
        hasRotatingPoint: { type: Boolean, default: true },
        height: Number,
        hoverCursor: String,
        includeDefaultValues: { type: Boolean, default: true },
        inverted: { type: Boolean, default: false },
        left: Number,
        lockMovementX: { type: Boolean, default: false },
        lockMovementY: { type: Boolean, default: false },
        lockRotation: { type: Boolean, default: false },
        lockScalingFlip: { type: Boolean, default: false },
        lockScalingX: { type: Boolean, default: false },
        lockScalingY: { type: Boolean, default: false },
        lockSkewingX: { type: Boolean, default: false },
        lockSkewingY: { type: Boolean, default: false },
        lockUniScaling: { type: Boolean, default: false },
        minScaleLimit: Number,
        moveCursor: String,
        noScaleCache: { type: Boolean, default: true },
        objectCaching: { type: Boolean, default: true },
        opacity: Number,
        originX: String,
        originY: String,
        padding: Number,
        paintFirst: String,
        perPixelTargetFind: { type: Boolean, default: false },
        rotatingPointOffset: Number,
        scaleX: Number,
        scaleY: Number,
        selectable: { type: Boolean, default: true },
        selectionBackgroundColor: String,
        //shadow :fabric.Shadow,
        skewX: Number,
        skewY: Number,
        //statefullCache: Boolean,
        stateProperties: Array,
        stroke: String,
        strokeDashArray: Array,
        strokeDashOffset: Number,
        strokeLineCap: String,
        strokeLineJoin: String,
        strokeMiterLimit: Number,
        strokeUniform: { type: Boolean, default: false },
        strokeWidth: Number,
        top: Number,
        //transformMatrix :Array, Depreciated,
        transparentCorners: { type: Boolean, default: true },
        //type :String, not editable
        visible: { type: Boolean, default: true },
        width: Number
    },
    inject: ["eventBus", "fabricWrapper"],
    computed: {
        canvas() {
            return this.fabricWrapper.canvas;
        },
        fabric() {
            return this.fabricWrapper.fabric;
        },
        definedProps() {
            const obj = { ...this.$props };
            Object.keys(obj).forEach(key => {
                if (obj[key] === undefined) {
                    delete obj[key];
                }
            });
            return obj;
        },
        item() {
            let canvasObj = this.canvas.getObjects();
            let res = [];
            this.transverseCanvasObjects(canvasObj, "id", this.id, res);
            return res[0];
        }
    },
    methods: {
        transverseCanvasObjects(objects, attr, val, objectList) {
            for (let i in objects) {
                if (objects[i]["type"] == "group") {
                    this.transverseCanvasObjects(objects[i].getObjects(), attr, val, objectList);
                } else if (objects[i][attr] == val) {
                    objectList.push(objects[i]);
                }
            }
        }
    },
    watch: {},
    created() {
        this.eventBus.$on("objectCreated", id => {
            if (this.id === id) {
                OBJECT_EVENTS.forEach(event => {
                    this.item.on(event, e => {
                        this.eventBus.$emit(event, { id: this.id, ...e });
                    });
                });
                //Setup Watchers for emmit sync option
                EMIT_PROPS.forEach(prop => {
                    this.$watch("item." + prop, watchEmitProp(prop, true));
                });
                //TODO setup watches for prop changes
            }
        });
    },
    beforeDestroy() {
        OBJECT_EVENTS.forEach(event => {
            this.item.off(event);
        });
    }
};
