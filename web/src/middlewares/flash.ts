import * as Koa from 'koa';
require('lodash');
const utils = require('utility');

type Next = () => Promise<any>;
const key = 'website_flash';

/// flash中间件
/// 可以使用ctx.state.flash添加flash变量
export = async function (ctx: Koa.Context, next: Next) {
	(<any>ctx).flash = ctx.session[key] || {};
	delete ctx.session[key];

	Object.defineProperty(ctx.state, 'flash', {
		enumerable: true,
		get: function () {
			return (<any>ctx).flash;
		},
		set: function (val) {
			if (utils.md5(val) != utils.md5((<any>ctx).flash)) {
				ctx.session[key] = val;
				(<any>ctx).flash = val;
			}
		}
	});

	await next();

	if (String(ctx.status).startsWith('30') && ctx.session && !(ctx.session[key])) {
		ctx.session[key] = (<any>ctx).flash;
	}
}