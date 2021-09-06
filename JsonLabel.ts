
import { _decorator, Component, Label, RichText } from "cc";
import { JsonUIManager, LanguageEventType } from "./JsonUIManager";

const { ccclass, property } = _decorator;

@ccclass("JsonLabel")
export default class JsonLabel extends Component {

    @property({
        displayName: '对应language.json中的id'
    })
    public id: string = '';

    private label: Label | RichText;

    private isInit: boolean = false;
    node: any;

    init(id: string) {
        if (this.isInit) return;

        this.isInit = true;
        JsonUIManager.event.targetOff(this);

        this.id = id;
        if (!this.label)
            this.label = this.node.getComponent(Label);
        if (!this.label) {
            this.label = this.node.getComponent(RichText);
        }
        if (!this.label) {
            console.warn('null component');
        }
        //注册开始初始化语言回调
        JsonUIManager.event.once(LanguageEventType.初始化多语言系统, () => {
            this.initLabel();
        }, this);

        //注册切换语言回调
        JsonUIManager.event.on(LanguageEventType.切换语言, (language) => {
            this.initLabel();
        }, this);

        this.initLabel();
    }

    onLoad() {
        if (this.id && this.id != '')
            this.init(this.id);
    }

    onEnable() {
        this.initLabel();
    }

    private initLabel() {
        if (this.label)
            this.label.string = JsonUIManager.GetLanguage(this.id);
    }
}
