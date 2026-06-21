import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'landing': { paramsTuple?: []; params?: {} }
    'contribution': { paramsTuple?: []; params?: {} }
    'audiences.search': { paramsTuple?: []; params?: {} }
    'audiences.jugements': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; jugementId: ParamValue }
    }
    'audiences.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'sign-up': { paramsTuple?: []; params?: {} }
    'auth.sign_in': { paramsTuple?: []; params?: {} }
    'auth.show_reset_password': {
      paramsTuple: [ParamValue, ParamValue]
      params: { token: ParamValue; email: ParamValue }
    }
    'analyses.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'legal': { paramsTuple?: []; params?: {} }
    'terms_of_use': { paramsTuple?: []; params?: {} }
    'auth.signup': { paramsTuple?: []; params?: {} }
    'auth.signin': { paramsTuple?: []; params?: {} }
    'auth.signout': { paramsTuple?: []; params?: {} }
    'auth.change_password': { paramsTuple?: []; params?: {} }
    'auth.forgotten_password': { paramsTuple?: []; params?: {} }
    'auth.handle_reset_password': { paramsTuple?: []; params?: {} }
    'webhooks.user': { paramsTuple?: []; params?: {} }
    'imports.import': { paramsTuple: [ParamValue]; params: { table: ParamValue } }
    'imports.export': { paramsTuple: [ParamValue]; params: { table: ParamValue } }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'landing': { paramsTuple?: []; params?: {} }
    'contribution': { paramsTuple?: []; params?: {} }
    'audiences.search': { paramsTuple?: []; params?: {} }
    'audiences.jugements': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; jugementId: ParamValue }
    }
    'audiences.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'sign-up': { paramsTuple?: []; params?: {} }
    'auth.sign_in': { paramsTuple?: []; params?: {} }
    'auth.show_reset_password': {
      paramsTuple: [ParamValue, ParamValue]
      params: { token: ParamValue; email: ParamValue }
    }
    'analyses.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'legal': { paramsTuple?: []; params?: {} }
    'terms_of_use': { paramsTuple?: []; params?: {} }
    'imports.export': { paramsTuple: [ParamValue]; params: { table: ParamValue } }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'landing': { paramsTuple?: []; params?: {} }
    'contribution': { paramsTuple?: []; params?: {} }
    'audiences.search': { paramsTuple?: []; params?: {} }
    'audiences.jugements': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; jugementId: ParamValue }
    }
    'audiences.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'sign-up': { paramsTuple?: []; params?: {} }
    'auth.sign_in': { paramsTuple?: []; params?: {} }
    'auth.show_reset_password': {
      paramsTuple: [ParamValue, ParamValue]
      params: { token: ParamValue; email: ParamValue }
    }
    'analyses.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'legal': { paramsTuple?: []; params?: {} }
    'terms_of_use': { paramsTuple?: []; params?: {} }
    'imports.export': { paramsTuple: [ParamValue]; params: { table: ParamValue } }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.signup': { paramsTuple?: []; params?: {} }
    'auth.signin': { paramsTuple?: []; params?: {} }
    'auth.signout': { paramsTuple?: []; params?: {} }
    'auth.change_password': { paramsTuple?: []; params?: {} }
    'auth.forgotten_password': { paramsTuple?: []; params?: {} }
    'auth.handle_reset_password': { paramsTuple?: []; params?: {} }
    'webhooks.user': { paramsTuple?: []; params?: {} }
    'imports.import': { paramsTuple: [ParamValue]; params: { table: ParamValue } }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}
