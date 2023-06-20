import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class User {

    _id: string; 

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ unique: true, required: true })
    name: string;

    @Prop({ required: true, minlength: 6 })
    password?: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [String], default: ['user'] })
    roles: string[];

}

export const UserSchema = SchemaFactory.createForClass( User );

