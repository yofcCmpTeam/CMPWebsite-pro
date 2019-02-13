import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'header-date',
  template: `
  <a nz-dropdown class="title-link">
    <i class="yofc-icon yf yf-calendar"></i>
    <span>{{loggedTime}}</span>
  </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderDateComponent implements OnInit {
  constructor(
    // private confirmServ: NzModalService,
    // private messageServ: NzMessageService,
  ) {}

  // @Input() currentMoment = '';

  loggedTime: string;
  ngOnInit() {
    this.loggedTime = moment().format('YYYY[-]M[-]D') + ' ' + this.fGetCurrentWeek(moment().format());
  }

  // 英文转换为中文周
  fGetCurrentWeek(time: string) {
    let sWeek = moment(time).format('dddd');
    switch (sWeek) {
        case 'Monday':
            sWeek = '星期一';
            break;
        case 'Tuesday':
            sWeek = '星期二';
            break;
        case 'Wednesday':
            sWeek = '星期三';
            break;
        case 'Thursday':
            sWeek = '星期四';
            break;
        case 'Friday':
            sWeek = '星期五';
            break;
        case 'Saturday':
            sWeek = '星期六';
            break;
        case 'Sunday':
            sWeek = '星期日';
            break;
        default:
            break;
    }
    return sWeek;
}
}
