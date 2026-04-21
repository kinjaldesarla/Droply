import {pgTable,text,boolean,integer,timestamp,uuid} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const files=pgTable("files",{
    id:uuid("id").defaultRandom().primaryKey(),

    // basic file/folder info
    name:text("name").notNull(),
    path:text("path").notNull(),
    size:integer("size").notNull(),
    type:text("type").notNull(),  // folder or file

    //stoarge info
    fileUrl:text("file_url").notNull(), // url to access the file
    thumbnailUrl:text("thumbnail_url"), // optional

     // Ownership and hierarchy
     userId:text("user_id").notNull(),
     parentId: uuid("parent_id"), // Parent folder ID (null for root items)

     // file/folder flags
     isFolder: boolean("is_folder").default(false).notNull(),// Whether this is a folder
     isStarred:boolean("is_starred").default(false).notNull(),// Starred/favorite items
     isTrash:boolean("is_trash").default(false).notNull(),// trashed item

     // timestamps
     createdAt:timestamp("created_at").defaultNow().notNull(),
     updatedAt:timestamp("updated_at").defaultNow().notNull()
});

// realtions
//1. parent - Each file/folder can have one parent folder
// 2. children - Each folder can have many child files/folders
export const filesRelation=relations(files,({one,many})=>({
    parent:one(files,{
        fields:[files.parentId], // The foreign key in this table
        references:[files.id] // The primary key in the parent table
    }),
    children:many(files)
}));

//type definations

export type File= typeof files.$inferSelect;
export type newFile=typeof files.$inferInsert;
