export class DeviceType {
  constructor(
    public id: string,
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public userId: string,
    public active: boolean,
  ){}
}
