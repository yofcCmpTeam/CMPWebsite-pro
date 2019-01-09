// 封装的各类 公用方法
import { Injectable , Injector} from '@angular/core';
import { NzModalRef, NzModalService, ModalButtonOptions, NzMessageService, NzNotificationService} from 'ng-zorro-antd';

// 定义组件实例类型
interface ComponentInstance {
  http: any;
  isOkBtnDisabled: boolean;
  handleOk: any;
}

@Injectable()
export class CommonService {

  constructor(
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private notificationService: NzNotificationService,
    private injector: Injector
    ) {}

  /**
   * 只含有一个按钮的确认框
   * @param data.type  success,info, warning, error
   */
  public showAlert(data: any): any {
    const type = data.type;
    const params = {
      nzTitle: data.nzTitle,
      nzContent: data.nzContent,
      nzWidth: data.nzWidth || 360,
      nzWrapClassName: data.nzWrapClassName || 'vertical-center-modal',
      nzOnOk: () => {
        if ( type === 'success') {
          this.modalService.closeAll();
        }

      }
    };
    return this.modalService[type](params);
  }

  /**
   * 包含组件的确认弹框
   */
  public showComponentConfirm(data: any, callback?: any): any {
    const nzTitle: string = data.nzTitle;
    const nzContent = data.nzContent;
    const nzWidth: string | number = data.nzWidth || 550;
    const type = data.type || 'primary';

    const nzOkText = data.nzOkText || '确定';
    const nzCancelText = data.nzCancelText || '取消';
    // 是否支持键盘esc关闭
    const nzKeyboard = data.nzKeyboard || false;
    // 点击蒙层是否允许关闭
    const nzMaskClosable = data.nzMaskClosable || false;
    // 弹框居中 vertical-center-modal
    const nzWrapClassName = data.nzWrapClassName;
    const nzComponentParams = data.nzComponentParams;
    const modal = this.modalService.create({
      nzTitle  : nzTitle,
      nzContent: nzContent,
      nzWidth: nzWidth,
      nzKeyboard : nzKeyboard,
      nzMaskClosable : nzMaskClosable,
      nzComponentParams: nzComponentParams,
      nzWrapClassName: nzWrapClassName,
      nzFooter: [{
        label: nzCancelText,
        loading: false,
        disabled: false,
        onClick: () => modal.destroy()
      }, {
        label: nzOkText,
        loading: (function(this: ModalButtonOptions, contentComponentInstance?: ComponentInstance)  {
          if (contentComponentInstance) {
            return contentComponentInstance.http.loading;
          }
        }),
        disabled: (function(this: ModalButtonOptions, contentComponentInstance?: ComponentInstance) {
          if (contentComponentInstance) {
            return contentComponentInstance.isOkBtnDisabled;
          }
        }),
        type: type,
        onClick(this: ModalButtonOptions, instance: ComponentInstance): void {
          if ( instance ) {
             instance.handleOk() ;
          }
        }
      }]
    });
    return  modal;
  }

  public createTplModal(tplTitle?: any, tplContent?: any,  tplFooter?: any): any {
    const tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });

    return tplModal;
  }

  /**
   * 删除弹框
   */
  public showDeleteConfirm(data: any): any {
    const nzTitle: string = data.nzTitle;
    const nzContent: string = data.nzContent;
    const nzWidth: string | number = data.nzWidth;

    // 确定按钮 loading
    const nzOkLoading = data.nzOkLoading || true;
    const nzOkText = data.nzOkText || '删除';
    const nzCancelText = data.nzCancelText || '取消';
    // 使用danger样式
    const nzOkType = 'danger';
    // 是否支持键盘esc关闭
    const nzKeyboard = data.nzKeyboard || false;
    // 点击蒙层是否允许关闭
    const nzMaskClosable = data.nzMaskClosable || false;
    return this.modalService.confirm({
      nzTitle  : nzTitle,
      nzContent: nzContent,
      nzWidth: nzWidth,
      nzOkLoading : nzOkLoading,
      nzOkText: nzOkText,
      nzCancelText: nzCancelText,
      nzKeyboard : nzKeyboard,
      nzMaskClosable : nzMaskClosable,
    });
  }

  /**
   * 消息提示框
   * success, warning, error
   */
  public msg(): NzMessageService {
    return this.injector.get(NzMessageService);
  }


  /**
   * 接口响应提示框提示框
   * success,info, warning, error
   */
  public toaster(data: any): NzNotificationService {
    return this.injector.get(NzNotificationService)[data.type](data.title, data.content);
  }
}
