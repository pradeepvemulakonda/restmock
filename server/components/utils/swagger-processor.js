import SwaggerParser from '@apidevtools/swagger-parser'

export const parseSwagger = async (swagger) => {
  return await SwaggerParser.validate(swagger)
}
