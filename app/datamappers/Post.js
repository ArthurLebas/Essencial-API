const client = require('../db/pg');
const CoreDatamapper = require('./coreDatamapper');
const photoDatamapper = require('./Photo');
const categoryDatamapper = require('./Category');
class Post extends CoreDatamapper {

    tableName = 'post';

    async findOneWithPhoto(postId){

        const preparedQuery = {
            text: `
            SELECT "post".*, "photo".path
            FROM "${this.tableName}"
            JOIN "photo" ON "post".user_id = "photo".user_id
            WHERE post."user_id" = $1`,
            values: [postId]
        }

        const result = await this.client.query(preparedQuery)

        if(!result.rows[0]) {
            return null
        }

        return result.rows[0]
    }

    async createWithPhotoAndCategory(post){

        // création d'un post sans la propriété path pour pouvoir l'insérer
        // dans la création d'un user
        const postWithoutPathAndCategory = JSON.parse(JSON.stringify(post));
        /* Reflect.deleteProperty(postWithoutPathAndCategory, 'path'); */
        delete postWithoutPathAndCategory.path
        /* Reflect.deleteProperty(postWithoutPathAndCategory, 'category_1'); */
        delete postWithoutPathAndCategory.category_1
        if(post.category_2){
            Reflect.deleteProperty(postWithoutPathAndCategory, 'category_2');   
        }

        console.log(postWithoutPathAndCategory);
        console.log(post);

        // insertion d'un post
        const postInsert = await this.create(postWithoutPathAndCategory);

        console.log("post insert --->" , postInsert);

        if(!postInsert){
            return null;
        }

        const photoInput = {
            post_id : postInsert.id,
            path: post.path
        }

        // insertion d'une photo
        const photoInsert = await photoDatamapper.create(photoInput)

        if(!photoInsert){
            return null;
        }

        // insertion d'une catégorie

       let categoryInsert

        if(!post.category_2){

            const findByName = await categoryDatamapper.findByName(post.category_1)
            console.log("findbyname --->" , findByName);
            const preparedQuery = {
                text: `INSERT INTO "post_has_category"
                        ("post_id", "category_id")
                        VALUES ($1,$2)
                        RETURNING *`,
                values:[postInsert.id, findByName.id]
            }

            categoryInsert = await this.client.query(preparedQuery)
            categoryInsert = categoryInsert.rows[0]
            console.log("category insert --->" , categoryInsert);

            return {
                post: postInsert,
                photo: photoInsert,
                category1: result1,
                message: "post created successfully"
            }

        } else {
            const findByName1 = await categoryDatamapper.findByName(post.category_1)

            const preparedQuery1 = {
                        text: `INSERT INTO "post_has_category"
                        ("post_id", "category_id")
                        VALUES ($1,$2)
                        RETURNING *`,
                        values: [postInsert.id, findByName1.id]
            }

            const findByName2 = await categoryDatamapper.findByName(post.category_2)

            const preparedQuery2 = {
                        text: `INSERT INTO "post_has_category"
                        ("post_id", "category_id")
                        VALUES ($1,$2)
                        RETURNING *`,
                        values: [postInsert.id, findByName2.id]
            }

            const result1 = await this.client.query(preparedQuery1)
            console.log(result1);
            const result2 = await this.client.query(preparedQuery2)
            console.log(result2);

            return {
                post: postInsert,
                photo: photoInsert,
                category1: result1,
                category2: result2,
                message: "post created successfully"
            }
        }


    }

    async findAllTuto(){
        // l'id 1 dans la table category correspond à tuto
        const preparedQuery = {
            text: `SELECT * FROM "post" 
            WHERE "id" IN (
            SELECT post_id FROM "post_has_category" WHERE category_id = $1
            )`,
            values: [1]
        }
        const result = await this.client.query(preparedQuery)

        if(!result.rows) {
            return null
        }
        if(result.rowCount > 1) {
            return result.rows
        }else{
            return result.rows[0]
        }
    }

}

module.exports = new Post(client);