export class User {
  //fields
  #client_id;
  #id;
  #login_name;
  #list_streamers;

  constructor(client_id,id, login_name,list_streamers) {
    this.#client_id = client_id;
    this.#id = id;
    this.#login_name = login_name;
    this.#list_streamers = list_streamers;

  }
  set client_id(client_id) {
    this.#client_id = client_id;
  }
  get client_id() {
    return this.client_id;
  }
  set id(id) {
    this.#id = id;
  }
  get id() {
    return this.id;
  }
  set login_name(login_name) {
    this.#login_name = login_name;
  }
  get login_name() {
    return this.login_name;
  }
  set list_streamers(list_streamers) {
    this.#list_streamers = list_streamers;
  }
  get list_streamers() {
    return this.list_streamers;
  }
}
