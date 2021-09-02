
import { _decorator, Component, JsonAsset, director, resources } from "cc";
import { JsonUIManager } from "./JsonUIManager";


const { ccclass, property } = _decorator;
/**
 * UI组件，挂在UI上
 */
@ccclass("JsonUI")
export default class JsonUI extends Component {


    @property({
        displayName: 'Json配置文件路径'
    })
    private JsonPath: string = '';

    @property(JsonAsset)
    private Json: JsonAsset = null;

    init(jsonPath: string) {
        this.JsonPath = jsonPath;
        director.targetOff(this);
        //注册开始初始化语言回调
        director.once('initJsonUI', () => {
            this.InitLanguage();
        }, this);

        //注册切换语言回调
        director.on('switchJsonUI', (language) => {
            if (this.Json) {
                // this.Json.json['Info'].language = language;
                this.initJson();
            }
        }, this);
        this.InitLanguage();
    }

    onLoad() {
        // let self =this;
        this.init(this.JsonPath);
    }

    // onEnable() {
    //     if (!this.Json && this.JsonPath) {
    //         this.InitLanguage();
    //     }
    // }


    private InitLanguage() {
        if (this.JsonPath && !this.Json) {
            resources.load(this.JsonPath, JsonAsset, (err, json: JsonAsset) => {
                if (err) {
                    console.warn(err);
                    return;
                }
                this.Json = json;
                // JsonUIManager.SwitchLanguage(this.Json.json.Info.language)
                // this.Json.json['Info'].language = JsonUIManager.CurrentLanguage;
                this.initJson();
            });
        }else if(this.Json){
            this.initJson();
        }
    }

    public async initJson() {
        if (this.Json)
            await JsonUIManager.InitUIRes(this.node, this.Json.json);
    }
}
