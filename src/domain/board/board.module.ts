import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { PostLike } from './entities/post-like.entity';
import { FreeBoardController } from './controllers/free-board.controller';
import { RequestBoardController } from './controllers/request-board.controller';
import { CommentController } from './controllers/comment.controller';
import { FreeBoardService } from './services/free-board.service';
import { RequestBoardService } from './services/request-board.service';
import { CommentService } from './services/comment.service';
import { S3Service } from '../../common/services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, PostLike])],
  controllers: [FreeBoardController, RequestBoardController, CommentController],
  providers: [FreeBoardService, RequestBoardService, CommentService, S3Service],
  exports: [FreeBoardService, RequestBoardService, CommentService],
})
export class BoardModule {}
