
import { _decorator, Component, Sprite, director, CCString } from "cc";
import { JsonUIManager, LanguageEventType } from "./JsonUIManager";

const {ccclass, property} = _decorator;

@ccclass("JsonSprite")
export default class JsonSprite extends Component {
    
    @property(CCString)
    private resPath:string='';

    private sprite:Sprite;

    init(resPath:string){
        this.resPath=resPath;

        this.sprite=this.node.getComponent(Sprite);

        JsonUIManager.event.targetOff(this);
        //注册开始初始化语言回调
        JsonUIManager.event.once(LanguageEventType.初始化多语言系统, () => {
            this.InitSprite();
        }, this);

        //注册切换语言回调
        JsonUIManager.event.on(LanguageEventType.切换语言, (language) => {
            this.InitSprite();
        }, this);
        this.InitSprite();
        JsonUIManager.event.on(LanguageEventType.切换语言前,()=>{
            this.sprite.spriteFrame=null;
        },this);
    }

    onLoad(){
        this.init(this.resPath);
    }

    async InitSprite(){
        if(this.sprite && this.resPath){
            this.sprite.spriteFrame = await JsonUIManager.GetSpriteFrame(this.resPath);
        }
    }
}
