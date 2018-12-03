module.exports = function HideMotes(mod) {
	const command = mod.command || mod.require.command;
	
	let motes = {};
	let enabled = false;
	let gameId;
	
	mod.hook('S_LOGIN', 10, (event) => {
		({ gameId } = event);
	});
	
	mod.hook('S_SPAWN_DROPITEM', 6, (event) => {
		if(event.source === gameId) return;
		if((event.item >= 8008 && event.item <= 8022) || event.item === 8023) {
			motes[event.gameId] = Object.assign({}, event);
			motes[event.gameId].explode = false;

			if(enabled) return false;
		}
	});
	
	mod.hook('S_DESPAWN_DROPITEM', 4, (event) => {
		delete motes[event.gameId];
		
		if(enabled) return false;
	});
	
	function hideMotes() {
		Object.keys(motes).forEach((mote) => {
			mod.send('S_DESPAWN_DROPITEM', 4, {
				gameId: motes[mote].gameId
			});
		});
	}
	
	function showMotes() {
		Object.keys(motes).forEach((mote) => {
			mod.send('S_SPAWN_DROPITEM', 6, motes[mote]);
		});
	}
	
	command.add('hidemotes', () => {
		if(!enabled) hideMotes();
		else showMotes();
		enabled = !enabled;
		command.message(`All motes are now ${(enabled) ? 'hidden' : 'visible'}.`);
	});
}