
function Riddle(id, question, answer, difficulty, duration, hint1, hint2, ownerId, deadline) {
   this.id = id,                 // number
   this.question = question,
   this.answer = answer,
   this.difficulty = difficulty,
   this.duration = duration,     // number 
   this.hint1 = hint1,
   this.hint2 = hint2,
   this.ownerId = ownerId,       // number
   this.deadline = deadline ? dayjs(deadline) : null  // datetime object
}

module.exports = Riddle;