export class User {
  //fields
  #token;
  #login_name;
  #profile_image;
  #list_streamers;

  constructor(token, login_name, profile_image,list_streamers) {
    this.#token = token;
    this.#login_name = login_name;
    this.#profile_image = profile_image;
    this.#list_streamers = list_streamers;
    t
  }
  set token(token) {
    this.#token = token;
  }
  get token() {
    return this.token;
  }
  set login_name(login_name) {
    this.#login_name = login_name;
  }
  get login_name() {
    return this.login_name;
  }
  set profile_image(profile_image) {
    this.#profile_image = profile_image;
  }
  get profile_image() {
    return this.profile_image;
  }
  set list_streamers(list_streamers) {
    this.#list_streamers = list_streamers;
  }
  get list_streamers() {
    return this.list_streamers;
  }
}
