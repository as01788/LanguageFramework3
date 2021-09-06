import { Enum, AssetManager, resources, JsonAsset, director, find, Sprite, SpriteFrame, Label, RichText, assetManager, Font, Node, EventTarget } from "cc";

/**
* 语言文件夹根目录
*/
export enum LanguageFolder {
    中文 = 'cn',
    中文香港 = 'hk',
    中文台湾 = 'tw',
    英文 = 'en',
    德文 = 'de',
    西班牙文 = 'es',
    丹麦文 = 'da',
    捷克文 = 'cs',
    希腊文 = 'el',
    意大利文 = 'it',
    日文 = 'jp',
    韩文 = 'kr',
    泰文 = 'th',
    乌克兰文 = 'uk',
    土耳其文 = 'tr',
    瑞典文 = 'sv',
    俄文 = 'ru',
    葡萄牙文 = 'pt',
    波兰文 = 'pl',
    荷兰文 = 'nl'
}

export enum LanguageEventType{
    初始化多语言系统,
    切换语言前,
    切换语言
}

const languageJsonPath: string = 'language';//language.json路径

Enum(LanguageFolder)
export class JsonUIManager {

    private static language: Map<string, any>;
    private static currentLanguage: LanguageFolder;
    public static get CurrentLanguage() {
        return this.currentLanguage;
    }
    private static currentBundle: AssetManager.Bundle;

    public static event = new EventTarget();


    public static Init(defaultLanguage: LanguageFolder) {
        // this.currentLanguage = defaultLanguage;
        resources.load(languageJsonPath, JsonAsset, (err, json: JsonAsset) => {
            if (err) {
                console.log(err);
                return;
            }
            this.language = new Map<string, any>();
            json.json['languages'].forEach(item => {
                if (!this.language.has(item.id)) {
                    this.language.set(item.id, item);
                }
            });
            // director.emit('initJsonUI');
            this.event.emit(LanguageEventType.初始化多语言系统);
        });
        this.SwitchLanguage(defaultLanguage, true);
    }

    public static async InitUIRes(startParent: Node, info) {
        if (!info) return;
        if (startParent) {

            // if (info.language) {
            //     info.UICompontents.forEach(item => {
            //         if (!item.bundleName)
            //             item.bundleName = info.language;
            //     });
            // }

            let UICompontent = null;
            for (let i: number = 0; i < info.UICompontents.length; i++) {
                UICompontent = info.UICompontents[i];

                if (UICompontent.path == "this") {
                    await this.InitComponent(startParent, UICompontent);
                } else {
                    if (UICompontent.path.indexOf("+") >= 0) {
                        let paths: string[] = UICompontent.path.split('+');
                        if (paths && paths.length > 0) {
                            for (let j: number = 0; j < paths.length; j++) {
                                await this.InitComponent(find(paths[j], startParent), UICompontent);
                            }
                        }
                    } else {
                        await this.InitComponent(find(UICompontent.path, startParent), UICompontent);
                    }
                }
            }
        } else {
            console.error('起始节点不能为空');
        }
    }
    private static async InitComponent(temp: Node, comt) {
        if (temp != null) {
            if (!comt.bundleName) {
                comt.bundleName = this.currentLanguage;
            }
            switch (comt.uiType) {
                case "Image":
                    let image: Sprite = temp.getComponent(Sprite);
                    if (image) {
                        let sprite: SpriteFrame = await JsonUIManager.loadSpriteFrame(comt.bundleName, comt.resName);
                        if (sprite){
                            image.spriteFrame = sprite;

                            if(JsonUIManager.isLanguageBundle(comt.bundleName))
                            this.event.once(LanguageEventType.切换语言前,()=>{
                                image.spriteFrame=null;
                            },this);
                        }
                    } else {
                        console.log(`路径：${comt.path}，无法找到Image组件`);
                    }
                    break;
                case "Font":
                    let text: Label | RichText = temp.getComponent(Label);
                    if (!text) {
                        text = temp.getComponent(RichText);
                    }
                    if (text) {
                        // text.font = await ResManager._Instance.GetRes<Font>("UIS/" + comt.resName);
                        text.font = await JsonUIManager.loadFontFromBundle(comt.bundleName, comt.resName);

                        if(JsonUIManager.isLanguageBundle(comt.bundleName))
                        this.event.once(LanguageEventType.切换语言前,()=>{
                            text.font=null;
                        },this);
                    } else {
                        console.log(`路径：${comt.path}，无法找到Label组件orRichText`);
                    }
                    break;
                case "Label":
                    let label: Label | RichText = temp.getComponent(Label);
                    if (!label) {
                        label = temp.getComponent(RichText);
                    }
                    if (label) {
                        label.string = this.GetLanguage(comt.resName);
                    } else {
                        console.log(`路径：${comt.path}，无法找到Label组件`);
                    }
                    break;
            }
        } else {
            console.log(`无法找到路径：${comt.path}`);
        }
    }

    static isLanguageBundle(bundleName:string):boolean{
        if(bundleName === LanguageFolder.中文 || bundleName === LanguageFolder.英文 || bundleName === LanguageFolder.中文香港 || bundleName === LanguageFolder.丹麦文 || bundleName === LanguageFolder.乌克兰文 || bundleName === LanguageFolder.俄文 || bundleName === LanguageFolder.土耳其文 || bundleName === LanguageFolder.希腊文 || bundleName === LanguageFolder.德文 || bundleName === LanguageFolder.意大利文 || bundleName === LanguageFolder.捷克文 || bundleName === LanguageFolder.日文 || bundleName === LanguageFolder.波兰文 || bundleName === LanguageFolder.泰文 || bundleName === LanguageFolder.瑞典文 || bundleName === LanguageFolder.中文台湾 || bundleName === LanguageFolder.荷兰文 || bundleName === LanguageFolder.葡萄牙文 || bundleName === LanguageFolder.西班牙文 || bundleName === LanguageFolder.韩文)
            return true;
        return false;
    }

    /**
     * 得到多语言字符串
     * @param id 对应language.json里的id
     */
    public static GetLanguage(id: string): string {
        if (this.language && this.language.has(id)) {
            switch (this.currentLanguage) {
                case LanguageFolder.中文:
                    return this.language.get(id).cn;
                case LanguageFolder.中文台湾:
                    return this.language.get(id).tw;
                case LanguageFolder.中文香港:
                    return this.language.get(id).hk;
                case LanguageFolder.丹麦文:
                    return this.language.get(id).da;
                case LanguageFolder.乌克兰文:
                    return this.language.get(id).uk;
                case LanguageFolder.俄文:
                    return this.language.get(id).ru;
                case LanguageFolder.土耳其文:
                    return this.language.get(id).tr;
                case LanguageFolder.希腊文:
                    return this.language.get(id).el;
                case LanguageFolder.德文:
                    return this.language.get(id).de;
                case LanguageFolder.意大利文:
                    return this.language.get(id).it;
                case LanguageFolder.捷克文:
                    return this.language.get(id).cs;
                case LanguageFolder.日文:
                    return this.language.get(id).jp;
                case LanguageFolder.波兰文:
                    return this.language.get(id).pl;
                case LanguageFolder.泰文:
                    return this.language.get(id).th;
                case LanguageFolder.瑞典文:
                    return this.language.get(id).sv;
                case LanguageFolder.英文:
                    return this.language.get(id).en;
                case LanguageFolder.荷兰文:
                    return this.language.get(id).nl;
                case LanguageFolder.葡萄牙文:
                    return this.language.get(id).pt;
                case LanguageFolder.西班牙文:
                    return this.language.get(id).es;
                case LanguageFolder.韩文:
                    return this.language.get(id).kr;
            }
        } else {
            console.log('没找到该文本id', id);
            return 'null';
        }
    }
    public static GetSpriteFrame(resName: string) {
        resName += "/spriteFrame";
        return new Promise<SpriteFrame>((resolve, reject) => {
            // let bundle = assetManager.getBundle(this.CurrentLanguage);
            if (this.currentBundle) {
                this.currentBundle.load(resName, SpriteFrame, (err, res: SpriteFrame) => {
                    if (err) {
                        console.warn(err);
                        resolve(null);
                    } else {
                        resolve(res);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }


    public static SwitchLanguage(language: LanguageFolder, isEmit: boolean = true) {
        if(language===this.currentLanguage) return;
        isEmit &&  this.event.emit(LanguageEventType.切换语言前);
        assetManager.loadBundle(language, (err, bundle: AssetManager.Bundle) => {
            if (err) {
                console.error(err);
                return;
            }

            //自动释放上次使用的bundle
            JsonUIManager.currentBundle && JsonUIManager.currentBundle.releaseAll();

            JsonUIManager.currentLanguage = language;
            JsonUIManager.currentBundle = bundle;
            isEmit && this.event.emit(LanguageEventType.切换语言);
                // director.emit('switchJsonUI', language);

            
        });
    }

    /**
     * 加载精灵
     * @param path 路径
     * @param bundleName bundle名称，null为resources
     */
    static async loadSpriteFrame(bundleName: string, path: string) {
        path += "/spriteFrame";

        return new Promise<SpriteFrame>((resolve, reject) => {
            if (bundleName === 'resources') {
                resources.load(path, SpriteFrame, (error: Error, res: SpriteFrame) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(res);
                });
            } else {
                //如果bundleName跟语言bundle一致，那么切换到当前语言的bundle
                
                if (JsonUIManager.isLanguageBundle(bundleName)) {
                    if (JsonUIManager.currentBundle)
                        JsonUIManager.currentBundle.load(path, SpriteFrame, (error: Error, res: SpriteFrame) => {
                            if (error) {
                                console.error(error);
                                resolve(null);
                            } else {
                                resolve(res);
                            }
                        });
                    else
                        resolve(null);
                } else {


                    assetManager.getBundle(bundleName)?.load(path, SpriteFrame, (err, res: SpriteFrame) => {
                        if (err) {
                            console.error(err);
                            resolve(null);
                        } else {
                            resolve(res);
                        }
                    });
                }
            }
        });
    }
    static loadFontFromResources(path: string) {
        return new Promise<Font>((resolve, reject) => {
            resources.load(path, Font, (error: Error, res: Font) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(res);
            });
        });
    }
    static loadFontFromBundle(bundleName: string, path: string) {
        return new Promise<Font>((resolve, reject) => {
            let bundle = assetManager.getBundle(bundleName);
            if (bundle) {
                bundle.load(path, Font, (error: Error, res: Font) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(res);
                });
            } else {
                reject(null);
            }
            
        });
    }
}