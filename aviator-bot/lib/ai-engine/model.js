import * as tf from '@tensorflow/tfjs';

class AviatorModel {
  constructor() {
    this.model = null;
    this.loaded = false;
  }
  
  async load() {
    if (this.loaded) return;
    
    try {
      // Charger le modèle pré-entraîné
      this.model = await tf.loadLayersModel('https://your-model-server.com/aviator-model.json');
      this.loaded = true;
      console.log('Modèle IA chargé avec succès');
    } catch (error) {
      console.error('Erreur de chargement du modèle:', error);
      await this.createNewModel();
    }
  }
  
  async createNewModel() {
    this.model = tf.sequential();
    
    // Architecture du modèle
    this.model.add(tf.layers.dense({
      units: 32,
      inputShape: [10],
      activation: 'relu'
    }));
    
    this.model.add(tf.layers.dense({
      units: 16,
      activation: 'relu'
    }));
    
    this.model.add(tf.layers.dense({
      units: 3,
      activation: 'softmax'
    }));
    
    // Compilation
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    this.loaded = true;
    console.log('Nouveau modèle créé');
  }
  
  async predict(inputData) {
    if (!this.loaded) await this.load();
    
    // Prétraitement des données d'entrée
    const inputTensor = tf.tensor2d([inputData]);
    const prediction = this.model.predict(inputTensor);
    const result = await prediction.data();
    
    return {
      action: this.getActionFromPrediction(result),
      confidence: Math.max(...result)
    };
  }
  
  getActionFromPrediction(prediction) {
    const actions = ['wait', 'bet-low', 'bet-high'];
    const maxIndex = prediction.indexOf(Math.max(...prediction));
    return actions[maxIndex];
  }
  
  async train(trainingData) {
    if (!this.loaded) await this.load();
    
    const {inputs, labels} = this.prepareTrainingData(trainingData);
    
    await this.model.fit(inputs, labels, {
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.2
    });
    
    // Sauvegarder les poids mis à jour
    await this.saveModel();
  }
  
  prepareTrainingData(rawData) {
    // TODO: Implémenter la préparation des données
    return {
      inputs: tf.tensor2d(rawData.inputs),
      labels: tf.tensor2d(rawData.labels)
    };
  }
  
  async saveModel() {
    // TODO: Implémenter la sauvegarde (localStorage ou serveur)
  }
}

export default new AviatorModel();