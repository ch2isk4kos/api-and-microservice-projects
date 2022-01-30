const users = [
    { _id: "1", username: "chris", }
]

const req = {
    params: {
        _id: "1"
    }
}

const test = (req, res) => {
  console.log("_id.logs -> req.body:", req.body);
  console.log("_id.logs -> req.params:", req.params);
  console.log("_id.logs -> req.query:", req.query);
  let { _id } = req.params;
  let { to, from, limit } = req.query;

  let user = users.find((u) => u._id === _id);
  console.log("user:", user);
  let logs = user.log;

  let fromDate = new Date(from);
  let toDate = new Date(to);

  if (from) {
    // logs = logs.filter((log) => log.date >= fromDate.toDate);
    logs = logs.filter((log) => {
      console.log("log.date:", log.date);
      console.log("fromDate:", fromDate);
      log.date >= fromDate.toDateString();
    });
  }
  if (to) {
    // logs = logs.filter((log) => log.date <= toDate);
    logs = logs.filter((log) => {
      console.log("log.date:", log.date);
      console.log("toDate:", toDate);
      log.date >= toDate.toDateString();
    });
  }
  if (limit) {
    logs = logs.slice(0, +limit);
  }

  // if (user) return res.json(user);
  // else return res.status(400).send("User Not Found");
  if (user) {
    return res.json({
      _id: user._id,
      username: user.username,
      from: fromDate.toDateString(),
      to: toDate.toDateString(),
      count: user.count,
      log: logs.map((log) => {
        return {
          description: log.description,
          duration: log.duration,
          date: log.date,
        };
      }),
    });
  } else return res.status(400).send("User Not Found");
});
