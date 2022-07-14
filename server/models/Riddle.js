

function Riddle(id, question, answer, difficulty, duration, hint1, hint2, ownerId, deadline, ownerUsername, birth) {
   this.id = id,                 // number
   this.question = question,
   this.answer = answer,
   this.difficulty = difficulty,
   this.duration = duration,     // number 
   this.hint1 = hint1,
   this.hint2 = hint2,
   this.ownerId = ownerId,       // number
   this.deadline = deadline ?? null,  // timestamp ISO String
   this.ownerUsername = ownerUsername,
   this.birth = birth ?? null    // timestamp ISO String
}

module.exports = Riddle;