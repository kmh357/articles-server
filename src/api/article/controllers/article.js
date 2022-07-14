"use strict";
const utils = require("@strapi/utils");
const { sanitize } = utils;

/**
 *  article controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::article.article", ({ strapi }) => ({
  async create(ctx) {
    // 사용자의 아이디를 데이터에 추가
    const id = ctx.state.user.id;

    const reqData = ctx.request.body;
    console.log(reqData);
    // article 데이터 생성
    const article = await strapi.entityService.create("api::article.article", {
      data: { ...reqData, user: ctx.state.user },
    });
    //잘못된 필드 및 private 값 제외하고 반환
    return { article };
  },
  async update(ctx) {
    //URL 파라메터에서 id 추출
    const { id } = ctx.params;
    //id로 데이터 조회
    const article = await strapi.entityService.findOne(
      "api::article.article",
      id,
      { populate: ["user"] }
    );
    console.log(article);
    //데이터가 존재하지 않을때
    if (!article) {
      return ctx.throw(404);
    }
    //user 정보는 변경할 수 없도록 처리
    if (ctx.request.body.user) {
      return ctx.throw(400, "user field cannot be changed");
    }
    //사용자의 id와 article의 작성자 id가 일치하는지 확인
    if (ctx.state.user.id !== article.user.id) {
      return ctx.unauthorized("You cannot update this entity");
    }
    //article 데이터 업데이트
    const entity = await strapi.entityService.update(
      "api::article.article",
      id,
      {
        data: ctx.request.body,
      }
    );
    //응답반환
    return { article: entity };
  },
  async delete(ctx) {
    //URL 파라메터에서 id 추출
    const { id } = ctx.params;
    //id로 데이터 조회
    const article = await strapi.entityService.findOne(
      "api::article.article",
      id,
      { populate: ["user"] }
    );

    //데이터가 존재하지 않을때
    if (!article) {
      return ctx.throw(404);
    }
    //사용자의 id와 article의 작성자 id가 일치하는지 확인
    if (ctx.state.user.id !== article.user.id) {
      return ctx.unauthorized("You cannot remove this entity");
    }
    const entity = await strapi.entityService.delete(
      "api::article.article",
      id
    );
    //응답반환
    ctx.status = 204; //no content
  },
}));
