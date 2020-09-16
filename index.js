module.exports = function HideMotes(mod) {
	const command = mod.command || mod.require.command;
	
	let motes = {};
	let enabled = false;
	let gameId;
	
	mod.hook('S_LOGIN', 14, (event) => {
		({ gameId } = event);
	});
	
	mod.hook('S_LOAD_TOPO', 'raw', () => {
		motes = {};
	});
	
	mod.hook('S_SPAWN_DROPITEM', 8, (event) => {
		if(event.item >= 8008 && event.item <= 8023) {
			motes[event.gameId] = Object.assign({}, event);
			motes[event.gameId].explode = false;

			if(enabled && event.source !== gameId) return false;
		}
	});
	
	mod.hook('S_DESPAWN_DROPITEM', 4, (event) => {
		if(motes[event.gameId]) {
			if(enabled && motes[event.gameId].source !== gameId) {
				delete motes[event.gameId];
				return false;
			}
			delete motes[event.gameId];
		}
	});
	
	function hideMotes() {
		Object.keys(motes).forEach((mote) => {
			if(motes[mote].source === gameId) return;
			
			mod.send('S_DESPAWN_DROPITEM', 4, {
				gameId: motes[mote].gameId
			});
		});
	}
	
	function showMotes() {
		Object.keys(motes).forEach((mote) => {
			if(motes[mote].source === gameId) return;
			
			mod.send('S_SPAWN_DROPITEM', 8, motes[mote]);
		});
	}
	
	command.add('hidemotes', () => {
		if(!enabled) hideMotes();
		else showMotes();
		enabled = !enabled;
		command.message(`All motes are now ${(enabled) ? 'hidden' : 'visible'}.`);
	});
}
