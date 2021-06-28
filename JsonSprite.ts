
import { _decorator, Component, Sprite, director, CCString } from "cc";
import { JsonUIManager } from "./JsonUIManager";

const {ccclass, property} = _decorator;

@ccclass("JsonSprite")
export default class JsonSprite extends Component {
    
    @property(CCString)
    private resPath:string='';

    private sprite:Sprite;

    init(resPath:string){
        this.resPath=resPath;

        this.sprite=this.node.getComponent(Sprite);

        director.targetOff(this);
        //注册开始初始化语言回调
        director.once('initJsonUI', () => {
            this.InitSprite();
        }, this);

        //注册切换语言回调
        director.on('switchJsonUI', (language) => {
            this.InitSprite();
        }, this);
        this.InitSprite();
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
