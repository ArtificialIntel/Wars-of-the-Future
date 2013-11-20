//Unit placement:

staticUnit.x = Math.floor(Math.random()*5);
staticUnit.y = Math.floor(Math.random()*5);
dynamicUnit.x = Math.floor(Math.random()*18);
dynamicUnit.y = Math.floor(Math.random()*(18-dynamicUnit.x));
movableUnit.x = Math.floor(Math.random()*18);
movableUnit.y = Math.floor(Math.random()*(18-movableUnit.x));

//Static unit:

if (staticUnit.alive)
{
    //movableUnit respawn capabilities
	if (!movableUnit.alive && counter==0)
	{
        movableUnit.alive=true;
		movableUnit.xPosition = staticUnit.x+2;
        movableUnit.yPosition = staticUnit.y+2;
	}
	else if (!movableUnit.alive)
        counter--;

    //defense
    var enemies=new Array();
	for (var x=staticUnit.x-staticUnit.range; x<=staticUnit.x+staticUnit.range; x++)
		for (var y=staticUnit.y-staticUnit.range; y<=staticUnit.y+staticUnit.range; y++)
			if (grid[x][y] != 0 && grid[x][y] != 1) //0->unoccupied cell 1->friendly unit 2->enemy unit
				enemies.push([x,y,enemyUnit.getDistance()<enemyUnit.range?true:false,enemyUnit.HP,enemyUnit.attack]);
	enemies.sort(function([a,b,c,d,e],[f,g,h,i,j])
	{
		if (c&&!h)
			return -1;
		if (!c&&h)
			return 1;
		if (d!=i)
			return d-i;
		return j-e;
	});
	if (enemies!=null)
	{
		var currentEnemy = enemies.pop();
		staticUnit.setAttack(currentEnemy[0],currentEnemy[1]);
	}
}

//Movable Unit:

if (movableUnit.alive)
{
	var distances = new Array();
	distances=[Math.abs(this.x-myStaticUnit.x)+Math.abs(this.y-myStaticUnit.y), Math.abs(this.x-myDynamicUnit.x)+Math.abs(this.y-myDynamicUnit.y), Math.abs(this.x-enemyStaticUnit.x)+Math.abs(this.y-enemyStaticUnit.y), Math.abs(this.x-enemyDynamicUnit.x)+Math.abs(this.y-enemyDynamicUnit.y), Math.abs(this.x-enemyMovableUnit.x)+Math.abs(this.y-enemyMovableUnit.y)];
	
	var priority = new Array();
	priority.push([4/distances[0],"defendSU"]); //add modifier
	priority.push([4/distances[1],"defendDU"]); //add modifier
	priority.push([3/distances[2],"attackSU"]); //add modifier
	priority.push([2/distances[3],"attackDU"]); //add modifier
	priority.push([2/distances[4],"attackMU"]); //add modifier
	priority.push([1/distances[1],"repair"]); //add modifier
	priority.sort(function([a,b],[c,d])
				{
					return c-a;
				});
	
	var currentTask = priority.pop()[1];
	while (true)
	{
		if (currentTask == "defendSU")
		{
			if (staticUnit.underAttack)
			{
				movableUnit.setDestination(staticUnit.attacker.x, staticUnit.attacker.y);
				break;
			}
			else
			{
				currentTask = proiority.pop()[1];
				continue;
			}
		}
		if (currentTask == "defendDU" && dynamicUnit.state = "inactive")
		{
			if (dynamicUnit.underAttack)
			{
				movableUnit.setDestination(dynamicUnit.attacker.x, dynamicUnit.attacker.y);
				break;
			}
			else
			{
				currentTask = proiority.pop()[1];
				continue;
			}
		}
		if (currentTask == "repair")
		{
			if (dynamicUnit.name=="turtle")
			{
				movableUnit.setDestination(dynamicUnit.x, dynamicUnit.y);
				break;
			}
			else
			{
				currentTask = proiority.pop()[1];
				continue;
			}
		}
		if (currentTask == "attackSU")
		{
			movableUnit.setDestination(enemyStaticUnit.x, enemyStaticUnit.y);
			break;
		}
		if (currentTask == "attackDU")
		{
			movableUnit.setDestination(enemyDynamicUnit.x, enemyDynamicUnit.y);
			break;
		}
		if (currentTask == "attackMU")
		{
			movableUnit.setDestination(enemyMovableUnit.x, enemyMovableUnit.y);
			break;
		}
	}
	
	//attack whenever possible
	var enemies=new Array();
	for (var x=movableUnit.x-movableUnit.range; x<=movableUnit.x+movableUnit.range; x++)
	for (var y=movableUnit.y-movableUnit.range; y<=movableUnit.y+movableUnit.range; y++)
		if (grid[x][y] != 0 && grid[x][y] != 1) //0->unoccupied cell 1->friendly unit 2->enemy unit
			enemies.push([x,y,enemyUnit.getDistance()<enemyUnit.range?true:false,enemyUnit.HP,enemyUnit.attack]);
	enemies.sort(function([a,b,c,d,e],[f,g,h,i,j])
				{
					if (c&&!h)
						return -1;
					if (!c&&h)
						return 1;
					if (d!=i)
						return d-i;
					return j-e;
				});
				
	if (enemies!=null)
	{
		var currentEnemy = enemies.pop();
		movableUnit.setAttack(currentEnemy[0],currentEnemy[1]);
	}
}