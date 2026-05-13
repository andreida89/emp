const posdust2 = new mp.Vector3(
	-3272.28,
	9571.66,
	1432.51
);

const rotdust2 = new mp.Vector3(0, 0, 15);

mp.objects.new(mp.joaat('de_dust2'), posdust2, {
	rotation: rotdust2,
	alpha: 255,
	dimension: 0
});