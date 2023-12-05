require 'sinatra'
require './sitemap/parser'

get '/posts' do
  content_type :json
  sitemap_texts = Sitemap::Parser.parse
  sitemap_texts.to_json
end
