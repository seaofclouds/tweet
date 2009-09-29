require 'rubygems'
require 'sinatra'

set :root, File.dirname(__FILE__)
set :public, Proc.new { File.join(root, "tweet") }

get "/" do
  File.open('./tweet/index.html')
end