const p1 = mp.peds.new(
	mp.game.joaat('a_f_y_business_01'),
	new mp.Vector3(1132.76, -474.41, 66.72),
	-16.6154,
	0
);

p1.freezePosition(true);
p1.setInvincible(true);
p1.setCanBeDamaged(false);
p1.taskStandStill(-1);

const p2 = mp.peds.new(
	mp.game.joaat('a_f_y_business_01'),
	new mp.Vector3(-657.53, -858.79, 24.49),
	7.1337,
	0
);

p2.freezePosition(true);
p2.setInvincible(true);
p2.setCanBeDamaged(false);
p2.taskStandStill(-1);