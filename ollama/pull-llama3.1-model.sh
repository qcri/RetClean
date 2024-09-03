./bin/ollama serve &

pid=$!
model="llama3.1"

sleep 5


echo "Pulling model $model"ß
ollama pull $model


wait $pid