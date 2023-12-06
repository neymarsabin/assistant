#!/usr/bin/env ruby
require 'sitemap-parser'
require 'nokogiri'
require 'open-uri'

module Sitemap
  class Parser
    def self.parse
      sitemap = SitemapParser.new 'https://neymarsabin.github.io/sitemap.xml'
      all_urls = sitemap.urls.to_a.map { |url| url.children[0].children.text }
      post_class_name = "post"

      url_with_texts = all_urls.map do |url|
        html = URI.open(url)
        doc = Nokogiri::HTML(html)
        elements = doc.css(".#{post_class_name}")
        texts = elements.map { |element| element.text }
        unless texts.empty?
          { url: url, texts: texts, lengths: texts.length }
        end
      end
      url_with_texts.compact
    end
  end
end
