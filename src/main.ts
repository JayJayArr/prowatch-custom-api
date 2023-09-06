import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(require.resolve('../secrets/official/key.pem')),
    cert: fs.readFileSync(require.resolve('../secrets/official/converted.pem'))
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions
  });
  app.use(helmet());
  app.use(compression());
  app.init();
  await app.listen(process.env.PORT);
}
bootstrap();
